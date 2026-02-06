import { nanoid } from 'nanoid'

/**
 * Apple Sign-In utilities for Cloudflare Workers
 * Uses Web Crypto API (no Node.js dependencies)
 */

interface AppleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  id_token: string
}

interface AppleIdTokenPayload {
  iss: string
  aud: string
  exp: number
  iat: number
  sub: string          // Apple user ID (stable)
  email?: string
  email_verified?: string | boolean
  is_private_email?: string | boolean
  nonce?: string
}

/**
 * Generate Apple client_secret JWT (ES256)
 * Apple requires the client secret to be a JWT signed with your private key
 */
export async function generateAppleClientSecret(): Promise<string> {
  const config = useRuntimeConfig()
  const teamId = config.appleTeamId
  const clientId = config.appleClientId
  const keyId = config.appleKeyId
  const privateKeyPem = config.appleSecretKey

  const now = Math.floor(Date.now() / 1000)

  // JWT Header
  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
  }

  // JWT Payload
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 15777000, // ~6 months (Apple max)
    aud: 'https://appleid.apple.com',
    sub: clientId,
  }

  // Import the private key
  const key = await importApplePrivateKey(privateKeyPem)

  // Sign the JWT
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${headerB64}.${payloadB64}`

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput),
  )

  // Convert DER signature to raw r||s format for JWT
  const sigB64 = base64UrlEncode(derToRaw(new Uint8Array(signature)))

  return `${signingInput}.${sigB64}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeAppleCode(code: string, redirectUri: string): Promise<AppleTokenResponse> {
  const config = useRuntimeConfig()
  const clientSecret = await generateAppleClientSecret()

  const params = new URLSearchParams({
    client_id: config.appleClientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  const response = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Apple token exchange failed:', errorText)
    throw createError({
      statusCode: 400,
      message: 'Failed to authenticate with Apple',
    })
  }

  return response.json() as Promise<AppleTokenResponse>
}

/**
 * Decode and validate Apple's id_token
 * For production, you should also verify the signature against Apple's public keys
 */
export function decodeAppleIdToken(idToken: string): AppleIdTokenPayload {
  const parts = idToken.split('.')
  if (parts.length !== 3) {
    throw createError({ statusCode: 400, message: 'Invalid Apple ID token' })
  }

  const payload = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/')))

  // Basic validation
  if (payload.iss !== 'https://appleid.apple.com') {
    throw createError({ statusCode: 400, message: 'Invalid token issuer' })
  }

  const config = useRuntimeConfig()
  if (payload.aud !== config.appleClientId) {
    throw createError({ statusCode: 400, message: 'Invalid token audience' })
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw createError({ statusCode: 400, message: 'Token expired' })
  }

  return payload as AppleIdTokenPayload
}

/**
 * Build the Apple authorization URL
 */
export function buildAppleAuthUrl(redirectUri: string, state: string): string {
  const config = useRuntimeConfig()

  const params = new URLSearchParams({
    client_id: config.appleClientId,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state,
  })

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`
}

// ============================================
// Crypto helpers (Web Crypto compatible)
// ============================================

async function importApplePrivateKey(pem: string): Promise<CryptoKey> {
  // Clean PEM: remove headers and whitespace
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/[\n\r\s]/g, '')

  const binaryDer = Uint8Array.from(atob(cleaned), c => c.charCodeAt(0))

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
}

function base64UrlEncode(input: string | Uint8Array): string {
  let base64: string
  if (typeof input === 'string') {
    base64 = btoa(input)
  }
  else {
    base64 = btoa(String.fromCharCode(...input))
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Convert DER-encoded ECDSA signature to raw r||s format
 * Web Crypto may return DER format, but JWT needs raw
 */
function derToRaw(der: Uint8Array): Uint8Array {
  // Check if it's already raw (64 bytes for P-256)
  if (der.length === 64) return der

  // DER format: 0x30 [len] 0x02 [r_len] [r] 0x02 [s_len] [s]
  if (der[0] !== 0x30) return der // not DER, return as-is

  let offset = 2 // skip SEQUENCE tag and length

  // Read r
  if (der[offset] !== 0x02) return der
  offset++
  const rLen = der[offset]!
  offset++
  let r = new Uint8Array(der.slice(offset, offset + rLen))
  offset += rLen

  // Read s
  if (der[offset] !== 0x02) return der
  offset++
  const sLen = der[offset]!
  offset++
  let s = new Uint8Array(der.slice(offset, offset + sLen))

  // Pad or trim to 32 bytes each
  r = padOrTrim(r, 32)
  s = padOrTrim(s, 32)

  const raw = new Uint8Array(64)
  raw.set(r, 0)
  raw.set(s, 32)
  return raw
}

function padOrTrim(buf: Uint8Array, size: number): Uint8Array {
  if (buf.length === size) return buf
  if (buf.length > size) return buf.slice(buf.length - size) // trim leading zeros
  const padded = new Uint8Array(size)
  padded.set(buf, size - buf.length)
  return padded
}
