import Stripe from 'stripe'
import { requireAuth } from '../../utils/requireAuth'

/**
 * POST /api/billing/portal
 * Creates a Stripe Customer Portal session for self-serve subscription management
 * Returns { url } to redirect user to
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig()

  if (!user.stripeCustomerId) {
    throw createError({
      statusCode: 400,
      message: 'No billing account found. Please subscribe to a plan first.',
    })
  }

  const stripe = new Stripe(config.stripeSecretKey)

  // Derive origin from request
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  const origin = `${proto}://${host}`

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/settings`,
  })

  return { url: session.url }
})
