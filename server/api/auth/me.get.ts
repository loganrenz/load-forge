import { validateSession, getUserSubscription } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session')
  
  if (!sessionId) {
    return { user: null }
  }
  
  const user = await validateSession(sessionId)
  
  if (!user) {
    // Clear invalid session cookie
    deleteCookie(event, 'session', { path: '/' })
    return { user: null }
  }
  
  // Get subscription info
  const subscription = await getUserSubscription(user.id)
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      subscription,
    },
  }
})
