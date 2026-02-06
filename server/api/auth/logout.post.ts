import { deleteSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session')
  
  if (sessionId) {
    await deleteSession(sessionId)
  }
  
  // Clear session cookie
  deleteCookie(event, 'session', {
    path: '/',
  })
  
  return { success: true }
})
