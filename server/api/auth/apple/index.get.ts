import { buildAppleAuthUrl } from '../../../utils/apple-auth'
import { nanoid } from 'nanoid'

/**
 * GET /api/auth/apple
 * Redirects user to Apple's authorization page
 */
export default defineEventHandler(async (event) => {
  // Derive the app URL from the incoming request so it works in any environment
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  const appUrl = `${proto}://${host}`

  // Generate a state token for CSRF protection
  const state = nanoid(32)

  // Store state in a short-lived cookie for validation on callback
  // Must use sameSite: 'none' because Apple's form_post is a cross-site POST
  setCookie(event, 'apple_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 600, // 10 minutes
  })

  const redirectUri = `${appUrl}/api/auth/apple/callback`
  const authUrl = buildAppleAuthUrl(redirectUri, state)

  return sendRedirect(event, authUrl)
})

