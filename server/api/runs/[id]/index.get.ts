import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/requireAuth'
import { useDatabase, testRuns, testScripts, testMetrics } from '../../../database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const runId = getRouterParam(event, 'id')
  const db = useDatabase()
  
  if (!runId) {
    throw createError({
      statusCode: 400,
      message: 'Run ID is required',
    })
  }
  
  // Get run with script info
  const [result] = await db.select({
    run: testRuns,
    script: testScripts,
  })
    .from(testRuns)
    .leftJoin(testScripts, eq(testRuns.scriptId, testScripts.id))
    .where(and(
      eq(testRuns.id, runId),
      eq(testRuns.userId, user.id)
    ))
    .limit(1)
  
  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Test run not found',
    })
  }
  
  // Get metrics if requested
  const query = getQuery(event)
  let metrics = null
  
  if (query.includeMetrics === 'true') {
    metrics = await db.select()
      .from(testMetrics)
      .where(eq(testMetrics.runId, runId))
      .orderBy(testMetrics.timestamp)
  }
  
  return {
    run: result.run,
    script: result.script,
    metrics,
  }
})
