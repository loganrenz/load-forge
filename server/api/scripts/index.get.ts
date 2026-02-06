import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/requireAuth'
import { useDatabase, testScripts } from '../../database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDatabase()
  
  const scripts = await db.select()
    .from(testScripts)
    .where(eq(testScripts.userId, user.id))
    .orderBy(testScripts.updatedAt)
  
  return { scripts }
})
