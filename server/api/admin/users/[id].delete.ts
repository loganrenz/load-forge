import { eq } from 'drizzle-orm'
import { useDatabase, users } from '../../../database'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const db = useDatabase()
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  // Prevent self-deletion
  if (userId === admin.id) {
    throw createError({ statusCode: 400, message: 'Cannot delete your own account' })
  }

  // Verify user exists
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Delete user (cascade will remove sessions, subscriptions, scripts, runs, etc.)
  await db.delete(users).where(eq(users.id, userId))

  return { success: true, deleted: userId }
})
