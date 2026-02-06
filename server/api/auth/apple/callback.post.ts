import { exchangeAppleCode, decodeAppleIdToken } from '../../../utils/apple-auth'
import { findOrCreateOAuthUser, createSession } from '../../../utils/auth'

/**
 * POST /api/auth/apple/callback
 * Apple redirects here via form_post with code, id_token, state, and optionally user info
 */
export default defineEventHandler(async (event) => {
  // Derive origin from request headers (matches the redirect endpoint)
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  const appUrl = `${proto}://${host}`
  const body = await readBody(event)

  const { code, id_token, state, user: userInfo } = body

  // Validate CSRF state
  const storedState = getCookie(event, 'apple_oauth_state')
  if (!storedState || storedState !== state) {
    return sendRedirect(event, '/login?error=invalid_state')
  }

  // Clear the state cookie
  deleteCookie(event, 'apple_oauth_state', { path: '/' })

  if (!code) {
    return sendRedirect(event, '/login?error=no_code')
  }

  try {
    const redirectUri = `${appUrl}/api/auth/apple/callback`

    // Exchange code for tokens
    const tokens = await exchangeAppleCode(code, redirectUri)

    // Decode the ID token to get user info
    const idTokenPayload = decodeAppleIdToken(tokens.id_token || id_token)

    // Apple only sends user info (name, email) on FIRST sign-in
    // After that, we only get the sub (Apple user ID)
    let email = idTokenPayload.email
    let name: string | undefined

    // Parse user info if provided (first sign-in only)
    if (userInfo) {
      try {
        const parsedUser = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
        if (parsedUser.email) email = parsedUser.email
        if (parsedUser.name) {
          const parts = []
          if (parsedUser.name.firstName) parts.push(parsedUser.name.firstName)
          if (parsedUser.name.lastName) parts.push(parsedUser.name.lastName)
          if (parts.length) name = parts.join(' ')
        }
      }
      catch {
        // ignore parse errors
      }
    }

    if (!email) {
      return sendRedirect(event, '/login?error=no_email')
    }

    // Find or create user
    const user = await findOrCreateOAuthUser({
      email,
      name,
      appleId: idTokenPayload.sub,
    })

    // Create session
    const sessionId = await createSession(user.id)

    // Set session cookie
    setCookie(event, 'session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return sendRedirect(event, '/dashboard')
  }
  catch (e: any) {
    console.error('Apple SSO error:', e)
    return sendRedirect(event, '/login?error=apple_auth_failed')
  }
})
