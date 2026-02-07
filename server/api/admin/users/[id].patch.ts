import { eq } from 'drizzle-orm'
import { useDatabase, users, subscriptions } from '../../../database'
import type { SubscriptionTier } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const db = useDatabase()
  const userId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  // Prevent removing own admin status
  if (userId === admin.id && body.isAdmin === false) {
    throw createError({ statusCode: 400, message: 'Cannot remove your own admin status' })
  }

  const updates: Record<string, any> = {}

  // Toggle admin
  if (typeof body.isAdmin === 'boolean') {
    updates.isAdmin = body.isAdmin
  }

  // Update name
  if (typeof body.name === 'string') {
    updates.name = body.name
  }

  // Apply user updates if any
  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date()
    await db.update(users).set(updates).where(eq(users.id, userId))
  }

  // Update subscription tier
  if (body.tier) {
    const validTiers: SubscriptionTier[] = ['free', 'pro', 'business', 'enterprise']
    if (!validTiers.includes(body.tier)) {
      throw createError({ statusCode: 400, message: `Invalid tier. Must be one of: ${validTiers.join(', ')}` })
    }
    await db
      .update(subscriptions)
      .set({ tier: body.tier, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
  }

  return { success: true }
})
