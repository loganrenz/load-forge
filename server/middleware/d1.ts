import { initDatabase } from '../database'

/**
 * Server middleware that initializes the D1 database from Cloudflare's binding
 * on every request. This makes `useDatabase()` available to all API handlers.
 */
export default defineEventHandler((event) => {
  const d1 = event.context.cloudflare?.env?.DB
  if (d1) {
    initDatabase(d1)
  }
})
