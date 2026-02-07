import { eq, count, desc } from 'drizzle-orm'
import { useDatabase, users, subscriptions, testScripts, testRuns } from '../../../database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = useDatabase()
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  // Get user with subscription
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
      stripeCustomerId: users.stripeCustomerId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      tier: subscriptions.tier,
      subscriptionStatus: subscriptions.status,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.id, userId))
    .limit(1)

  if (!result.length) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const user = result[0]

  // Get user's scripts and run counts
  const [scriptCount, runCount, recentRuns] = await Promise.all([
    db.select({ total: count() }).from(testScripts).where(eq(testScripts.userId, userId)),
    db.select({ total: count() }).from(testRuns).where(eq(testRuns.userId, userId)),
    db.select()
      .from(testRuns)
      .where(eq(testRuns.userId, userId))
      .orderBy(desc(testRuns.createdAt))
      .limit(5),
  ])

  return {
    user,
    stats: {
      scripts: scriptCount[0]?.total || 0,
      runs: runCount[0]?.total || 0,
    },
    recentRuns,
  }
})
