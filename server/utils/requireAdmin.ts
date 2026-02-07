import type { User } from '../database/schema'

/**
 * Require admin authentication.
 * Calls requireAuth first, then checks isAdmin flag.
 */
export async function requireAdmin(event: any): Promise<User> {
  const user = await requireAuth(event)

  if (!user.isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Admin access required',
    })
  }

  return user
}
