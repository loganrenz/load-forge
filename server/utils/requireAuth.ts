import { eq } from 'drizzle-orm'
import { useDatabase, users, sessions } from '../database'
import type { User } from '../database/schema'

/**
 * Require authentication middleware
 * Sets event.context.user if authenticated
 */
export async function requireAuth(event: any): Promise<User> {
  const sessionId = getCookie(event, 'session')
  
  if (!sessionId) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }
  
  const db = useDatabase()
  
  const result = await db.select({
    user: users,
    session: sessions,
  })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1)
  
  if (!result.length) {
    deleteCookie(event, 'session', { path: '/' })
    throw createError({
      statusCode: 401,
      message: 'Session expired. Please log in again.',
    })
  }
  
  const { user, session } = result[0]
  
  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    deleteCookie(event, 'session', { path: '/' })
    throw createError({
      statusCode: 401,
      message: 'Session expired. Please log in again.',
    })
  }
  
  event.context.user = user
  return user
}
