import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema'

/// <reference types="@cloudflare/workers-types" />

// Database connection singleton
let _db: DrizzleD1Database<typeof schema> | null = null

export function useDatabase(d1?: any) {
  if (_db) return _db

  // In Cloudflare Workers/Pages, D1 is injected via binding
  // If d1 is provided directly, use it; otherwise try to get from Nitro event context
  if (d1) {
    _db = drizzle(d1, { schema })
    return _db
  }

  throw new Error('D1 database binding not available. Pass the D1 binding from event context.')
}

/**
 * Initialize database from Cloudflare event context.
 * Call this from a Nitro server middleware or at the top of each handler.
 */
export function initDatabase(d1: any): DrizzleD1Database<typeof schema> {
  _db = drizzle(d1, { schema })
  return _db
}

// Re-export schema for convenience
export * from './schema'
export { schema }
