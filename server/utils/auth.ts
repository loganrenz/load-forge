import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'
import { useDatabase, users, sessions, subscriptions } from '../database'
import type { User, SubscriptionTier } from '../database/schema'

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

// ============================================
// Web Crypto PBKDF2 password hashing
// (replaces @node-rs/argon2 for Cloudflare Workers compat)
// ============================================

const PBKDF2_ITERATIONS = 100_000
const SALT_LENGTH = 16
const KEY_LENGTH = 32

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const encoder = new TextEncoder()
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  )
  
  const hashArray = new Uint8Array(derivedBits)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `pbkdf2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`
}

async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const parts = stored.split(':')
  if (parts[0] !== 'pbkdf2' || parts.length !== 4) return false
  
  const iterations = parseInt(parts[1])
  const salt = new Uint8Array(parts[2].match(/.{2}/g)!.map(b => parseInt(b, 16)))
  const storedHash = parts[3]
  
  const encoder = new TextEncoder()
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  )
  
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return hashHex === storedHash
}

// ============================================
// User management
// ============================================

/**
 * Create a new user with email/password
 */
export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const db = useDatabase()
  const passwordHash = await hashPassword(password)
  const userId = nanoid()
  
  // Create user
  const [user] = await db.insert(users).values({
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    name,
  }).returning()
  
  // Create free subscription
  await db.insert(subscriptions).values({
    id: nanoid(),
    userId,
    tier: 'free',
    status: 'active',
  })
  
  return user
}

/**
 * Verify user credentials and return user if valid
 */
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const db = useDatabase()
  
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)
  
  if (!user || !user.passwordHash) {
    return null
  }
  
  const valid = await verifyPassword(user.passwordHash, password)
  return valid ? user : null
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const db = useDatabase()
  const sessionId = nanoid(32)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  })
  
  return sessionId
}

/**
 * Validate session and return user
 */
export async function validateSession(sessionId: string): Promise<User | null> {
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
    return null
  }
  
  const { user, session } = result[0]
  
  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return null
  }
  
  return user
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const db = useDatabase()
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscription(userId: string): Promise<{ tier: SubscriptionTier; status: string }> {
  const db = useDatabase()
  
  const [sub] = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)
  
  if (!sub) {
    return { tier: 'free', status: 'active' }
  }
  
  return { tier: sub.tier, status: sub.status }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const db = useDatabase()
  
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  
  return user || null
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = useDatabase()
  
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)
  
  return user || null
}

/**
 * Find or create an OAuth user (e.g. Apple Sign-In)
 * If user exists by email, returns them. Otherwise creates a new user without password.
 */
export async function findOrCreateOAuthUser(opts: {
  email: string
  name?: string
  appleId?: string
}): Promise<User> {
  const db = useDatabase()
  
  // Check if user already exists
  const existing = await getUserByEmail(opts.email)
  if (existing) {
    // Optionally update name if not set
    if (opts.name && !existing.name) {
      await db.update(users)
        .set({ name: opts.name, updatedAt: new Date() })
        .where(eq(users.id, existing.id))
      existing.name = opts.name
    }
    return existing
  }
  
  // Create new OAuth user (no password)
  const userId = nanoid()
  const [user] = await db.insert(users).values({
    id: userId,
    email: opts.email.toLowerCase(),
    passwordHash: null,
    name: opts.name || null,
  }).returning()
  
  // Create free subscription
  await db.insert(subscriptions).values({
    id: nanoid(),
    userId,
    tier: 'free',
    status: 'active',
  })
  
  return user
}
