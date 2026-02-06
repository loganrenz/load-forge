import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/requireAuth'
import { users } from '../../database/schema'
import { useDatabase } from '../../database'

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout session for subscription upgrade
 * Body: { priceId: string }
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig()
  const { priceId } = await readBody(event)

  if (!priceId) {
    throw createError({ statusCode: 400, message: 'priceId is required' })
  }

  const stripe = new Stripe(config.stripeSecretKey)

  // Derive origin from request
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  const origin = `${proto}://${host}`

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id

    // Save customer ID to user record
    const db = useDatabase()
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, user.id))
  }

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
    subscription_data: {
      metadata: { userId: user.id },
    },
  })

  return { url: session.url }
})
