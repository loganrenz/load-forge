import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/requireAuth'
import { useDatabase, testScripts } from '../../../database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const scriptId = getRouterParam(event, 'id')
  const db = useDatabase()
  
  if (!scriptId) {
    throw createError({
      statusCode: 400,
      message: 'Script ID is required',
    })
  }
  
  const [script] = await db.select()
    .from(testScripts)
    .where(and(
      eq(testScripts.id, scriptId),
      eq(testScripts.userId, user.id)
    ))
    .limit(1)
  
  if (!script) {
    throw createError({
      statusCode: 404,
      message: 'Script not found',
    })
  }
  
  return { script }
})
