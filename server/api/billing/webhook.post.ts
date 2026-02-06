import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { subscriptions, users } from '../../database/schema'
import { useDatabase } from '../../database'
import type { SubscriptionTier, SubscriptionStatus } from '../../database/schema'

/**
 * POST /api/billing/webhook
 * Receives Stripe webhook events
 * NOT authenticated via session — validated via stripe-signature header
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  const body = await readRawBody(event)
  const signature = getRequestHeader(event, 'stripe-signature')

  if (!body || !signature) {
    throw createError({ statusCode: 400, message: 'Missing body or signature' })
  }

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = await stripe.webhooks.constructEventAsync(body, signature, config.stripeWebhookSecret)
  }
  catch {
    throw createError({ statusCode: 400, message: 'Invalid webhook signature' })
  }

  const db = useDatabase()

  switch (stripeEvent.type) {
    // ---- Checkout completed → create/update subscription ----
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      // Fetch full subscription to get price details
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as any
      const priceId = stripeSub.items?.data?.[0]?.price?.id || ''
      const tier = mapPriceIdToTier(priceId)
      const userId = stripeSub.metadata?.userId || await findUserByCustomerId(customerId)

      if (!userId) {
        console.error('No userId found for customer', customerId)
        break
      }

      // Upsert subscription record
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(subscriptions)
          .set({
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            tier,
            status: 'active',
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId))
      }
      else {
        await db.insert(subscriptions).values({
          id: nanoid(),
          userId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          tier,
          status: 'active',
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          cancelAtPeriodEnd: false,
        })
      }
      break
    }

    // ---- Subscription updated (plan change, renewal, cancel scheduled) ----
    case 'customer.subscription.updated': {
      const stripeSub = stripeEvent.data.object as any
      const subscriptionId = stripeSub.id
      const priceId = stripeSub.items.data[0]?.price?.id || ''
      const tier = mapPriceIdToTier(priceId)

      const status: SubscriptionStatus =
        stripeSub.status === 'active' ? 'active'
          : stripeSub.status === 'past_due' ? 'past_due'
            : stripeSub.status === 'trialing' ? 'trialing'
              : 'canceled'

      await db
        .update(subscriptions)
        .set({
          stripePriceId: priceId,
          tier,
          status,
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end || false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
      break
    }

    // ---- Subscription deleted → revert to free ----
    case 'customer.subscription.deleted': {
      const stripeSub = stripeEvent.data.object as any
      await db
        .update(subscriptions)
        .set({
          tier: 'free',
          status: 'canceled',
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
      break
    }

    // ---- Payment failed ----
    case 'invoice.payment_failed': {
      const invoice = stripeEvent.data.object as any
      const subscriptionId = invoice.subscription as string
      if (subscriptionId) {
        await db
          .update(subscriptions)
          .set({
            status: 'past_due',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
      }
      break
    }
  }

  return { received: true }
})

// ============================================
// Helpers
// ============================================

function mapPriceIdToTier(priceId: string): SubscriptionTier {
  const config = useRuntimeConfig()
  const proPriceId = config.stripePriceIdPro
  const businessPriceId = config.stripePriceIdBusiness

  if (priceId === proPriceId) return 'pro'
  if (priceId === businessPriceId) return 'business'
  return 'free'
}

async function findUserByCustomerId(customerId: string): Promise<string | null> {
  const db = useDatabase()
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1)

  return user?.id || null
}
