import { z } from 'zod'
import { nanoid } from 'nanoid'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/requireAuth'
import { getUserSubscription } from '../../../utils/auth'
import { validateTestConfig, getTierLimits } from '../../../utils/subscription'
import { useDatabase, testScripts, testRuns } from '../../../database'
import { executeTestRun } from '../../../utils/testRunner'

const runTestSchema = z.object({
  vus: z.number().min(1).max(10000),
  duration: z.string().regex(/^\d+(s|m|h)$/, 'Invalid duration format'),
  regions: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const scriptId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = useDatabase()
  
  if (!scriptId) {
    throw createError({
      statusCode: 400,
      message: 'Script ID is required',
    })
  }
  
  // Validate input
  const result = runTestSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }
  
  // Verify script ownership
  const [script] = await db.select()
    .from(testScripts)
    .where(and(
      eq(testScripts.id, scriptId),
      eq(testScripts.userId, user.id)
    ))
    .limit(1)
  
  if (!script) {
    throw createError({
      statusCode: 404,
      message: 'Script not found',
    })
  }
  
  // Check subscription limits
  const subscription = await getUserSubscription(user.id)
  const validation = validateTestConfig(result.data, subscription.tier)
  
  if (!validation.valid) {
    throw createError({
      statusCode: 403,
      message: validation.error,
    })
  }
  
  // Check concurrent test limit
  const limits = getTierLimits(subscription.tier)
  const runningTests = await db.select()
    .from(testRuns)
    .where(and(
      eq(testRuns.userId, user.id),
      eq(testRuns.status, 'running')
    ))
  
  if (runningTests.length >= limits.maxConcurrentTests) {
    throw createError({
      statusCode: 429,
      message: `Concurrent test limit reached. Your plan allows ${limits.maxConcurrentTests} concurrent test(s).`,
    })
  }
  
  // Create test run
  const [run] = await db.insert(testRuns).values({
    id: nanoid(),
    scriptId,
    userId: user.id,
    status: 'queued',
    config: {
      vus: result.data.vus,
      duration: result.data.duration,
      regions: result.data.regions || ['iad'],
    },
  }).returning()
  
  // Execute the test run in the background via Cloudflare waitUntil
  const waitUntil = event.context.cloudflare?.context?.waitUntil?.bind(event.context.cloudflare.context)
  executeTestRun(run.id, waitUntil)
  
  return { run }
})

