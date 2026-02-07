import { count, eq, sql } from 'drizzle-orm'
import { useDatabase, users, testScripts, testRuns, subscriptions } from '../../database'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = useDatabase()

  // Run all stat queries in parallel
  const [userStats, scriptStats, runStats, subStats] = await Promise.all([
    // Total users
    db.select({ total: count() }).from(users),

    // Total scripts
    db.select({ total: count() }).from(testScripts),

    // Runs by status
    db.select({
      status: testRuns.status,
      total: count(),
    })
      .from(testRuns)
      .groupBy(testRuns.status),

    // Subscriptions by tier
    db.select({
      tier: subscriptions.tier,
      total: count(),
    })
      .from(subscriptions)
      .groupBy(subscriptions.tier),
  ])

  return {
    users: userStats[0]?.total || 0,
    scripts: scriptStats[0]?.total || 0,
    runs: {
      total: runStats.reduce((sum, r) => sum + r.total, 0),
      byStatus: Object.fromEntries(runStats.map(r => [r.status, r.total])),
    },
    subscriptions: Object.fromEntries(subStats.map(s => [s.tier, s.total])),
  }
})
