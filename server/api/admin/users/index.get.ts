import { count, eq, like, or, sql, desc } from 'drizzle-orm'
import { useDatabase, users, subscriptions, testScripts, testRuns } from '../../../database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = useDatabase()
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const search = (query.search as string)?.trim() || ''
  const offset = (page - 1) * limit

  // Build WHERE clause for search
  const whereClause = search
    ? or(
        like(users.email, `%${search}%`),
        like(users.name, `%${search}%`)
      )
    : undefined

  // Get total count
  const totalResult = await db
    .select({ total: count() })
    .from(users)
    .where(whereClause)

  const total = totalResult[0]?.total || 0

  // Get paginated users with their subscription info
  const userList = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
      tier: subscriptions.tier,
      subscriptionStatus: subscriptions.status,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    users: userList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
