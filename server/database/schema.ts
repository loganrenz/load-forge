import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ============================================
// Users & Authentication
// ============================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // nanoid
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // null for OAuth users
  name: text('name'),
  avatarUrl: text('avatar_url'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ============================================
// Subscriptions & Billing
// ============================================

export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripePriceId: text('stripe_price_id'),
  tier: text('tier').$type<SubscriptionTier>().notNull().default('free'),
  status: text('status').$type<SubscriptionStatus>().notNull().default('active'),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ============================================
// Load Test Scripts
// ============================================

export const testScripts = sqliteTable('test_scripts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  script: text('script').notNull(), // k6 JavaScript code
  config: text('config', { mode: 'json' }).$type<TestScriptConfig>().default({}),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export interface TestScriptConfig {
  thresholds?: Record<string, string[]>
  scenarios?: Record<string, unknown>
}

// ============================================
// Test Runs
// ============================================

export type TestRunStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

export const testRuns = sqliteTable('test_runs', {
  id: text('id').primaryKey(),
  scriptId: text('script_id').notNull().references(() => testScripts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').$type<TestRunStatus>().notNull().default('pending'),
  config: text('config', { mode: 'json' }).$type<TestRunConfig>().notNull(),
  metrics: text('metrics', { mode: 'json' }).$type<TestMetricsSummary>(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export interface TestRunConfig {
  vus: number
  duration: string // e.g., '30s', '5m'
  regions?: string[]
}

export interface TestMetricsSummary {
  http_reqs: number
  http_req_duration_avg: number
  http_req_duration_p95: number
  http_req_duration_p99: number
  http_req_failed: number
  data_received: number
  data_sent: number
  iterations: number
  vus_max: number
}

// ============================================
// Real-time Test Metrics (for streaming)
// ============================================

export const testMetrics = sqliteTable('test_metrics', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull().references(() => testRuns.id, { onDelete: 'cascade' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  data: text('data', { mode: 'json' }).$type<MetricDataPoint>().notNull(),
})

export interface MetricDataPoint {
  http_reqs: number
  http_req_duration: number
  http_req_failed: number
  vus: number
  iterations: number
}

// ============================================
// Usage Tracking
// ============================================

export const usageRecords = sqliteTable('usage_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  periodStart: text('period_start').notNull(), // YYYY-MM format
  vuMinutes: integer('vu_minutes').notNull().default(0),
  testCount: integer('test_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// ============================================
// API Keys (for programmatic access)
// ============================================

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(), // hashed API key
  keyPrefix: text('key_prefix').notNull(), // first 8 chars for display
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// Type exports for use in application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
export type TestScript = typeof testScripts.$inferSelect
export type NewTestScript = typeof testScripts.$inferInsert
export type TestRun = typeof testRuns.$inferSelect
export type NewTestRun = typeof testRuns.$inferInsert
export type UsageRecord = typeof usageRecords.$inferSelect
export type ApiKey = typeof apiKeys.$inferSelect
