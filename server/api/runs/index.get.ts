import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '../../utils/requireAuth'
import { useDatabase, testRuns, testScripts } from '../../database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDatabase()
  
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const offset = parseInt(query.offset as string) || 0
  
  const runs = await db.select({
    run: testRuns,
    script: {
      id: testScripts.id,
      name: testScripts.name,
    },
  })
    .from(testRuns)
    .leftJoin(testScripts, eq(testRuns.scriptId, testScripts.id))
    .where(eq(testRuns.userId, user.id))
    .orderBy(desc(testRuns.createdAt))
    .limit(limit)
    .offset(offset)
  
  return { runs }
})
