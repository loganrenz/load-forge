import { eq, and } from 'drizzle-orm'
import { testRuns } from '../database/schema'
import type { SubscriptionTier } from '../database/schema'

// ============================================
// Tier Limits Configuration
// ============================================

export interface TierLimits {
  maxVUs: number
  maxDuration: string      // human-readable
  maxDurationSeconds: number
  maxConcurrentTests: number
  historyDays: number
  apiAccess: boolean
  scheduledTests: boolean
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxVUs: 200,
    maxDuration: '5 minutes',
    maxDurationSeconds: 300,
    maxConcurrentTests: 3,
    historyDays: 30,
    apiAccess: true,
    scheduledTests: false,
  },
  pro: {
    maxVUs: 1000,
    maxDuration: '15 minutes',
    maxDurationSeconds: 900,
    maxConcurrentTests: 5,
    historyDays: 90,
    apiAccess: true,
    scheduledTests: true,
  },
  business: {
    maxVUs: 5000,
    maxDuration: '60 minutes',
    maxDurationSeconds: 3600,
    maxConcurrentTests: 25,
    historyDays: 365,
    apiAccess: true,
    scheduledTests: true,
  },
  enterprise: {
    maxVUs: 50000,
    maxDuration: '120 minutes',
    maxDurationSeconds: 7200,
    maxConcurrentTests: 100,
    historyDays: 365,
    apiAccess: true,
    scheduledTests: true,
  },
}

// ============================================
// Stripe Price → Tier Mapping
// ============================================

// These will be set once Stripe products/prices are created
// Format: { 'price_xxx': 'pro', 'price_yyy': 'business' }
const PRICE_TO_TIER: Record<string, SubscriptionTier> = {}

export function registerPriceIds(mapping: Record<string, SubscriptionTier>) {
  Object.assign(PRICE_TO_TIER, mapping)
}

export function mapPriceToTier(priceId: string): SubscriptionTier {
  return PRICE_TO_TIER[priceId] || 'free'
}


export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier]
}

// ============================================
// Test Config Validation
// ============================================

/** Parse k6 duration string to seconds (e.g., '30s' → 30, '5m' → 300) */
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h)$/)
  if (!match) return 0
  const value = parseInt(match[1]!)
  switch (match[2]) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 3600
    default: return 0
  }
}

export function validateTestConfig(
  config: { vus: number; duration: string },
  tier: SubscriptionTier,
): { valid: boolean; error?: string } {
  const limits = getTierLimits(tier)

  // Check VUs
  if (config.vus > limits.maxVUs) {
    return {
      valid: false,
      error: `Your ${tier} plan allows up to ${limits.maxVUs} VUs. Requested: ${config.vus}. Upgrade to increase your limit.`,
    }
  }

  // Check duration
  const durationSeconds = parseDurationToSeconds(config.duration)
  if (durationSeconds > limits.maxDurationSeconds) {
    return {
      valid: false,
      error: `Your ${tier} plan allows tests up to ${limits.maxDuration}. Upgrade to run longer tests.`,
    }
  }

  return { valid: true }
}
