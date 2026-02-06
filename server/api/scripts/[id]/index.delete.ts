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
  
  // Verify ownership and delete
  const deleted = await db.delete(testScripts)
    .where(and(
      eq(testScripts.id, scriptId),
      eq(testScripts.userId, user.id)
    ))
    .returning()
  
  if (!deleted.length) {
    throw createError({
      statusCode: 404,
      message: 'Script not found',
    })
  }
  
  return { success: true }
})
