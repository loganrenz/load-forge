import { eq } from 'drizzle-orm'
import { useDatabase, testRuns, testMetrics } from '../database'
import type { TestMetricsSummary, MetricDataPoint, TestRunConfig } from '../database/schema'
import { nanoid } from 'nanoid'

/**
 * Executes a test run in the background.
 * In production, this would dispatch to a worker running k6.
 * In Cloudflare Workers, uses waitUntil for background execution.
 */
export function executeTestRun(runId: string, waitUntil?: (promise: Promise<unknown>) => void) {
  const promise = runTestSimulation(runId).catch((err) => {
    console.error(`[TestRunner] Failed to execute run ${runId}:`, err)
    const db = useDatabase()
    db.update(testRuns)
      .set({
        status: 'failed',
        errorMessage: err.message || 'Unknown execution error',
        completedAt: new Date(),
      })
      .where(eq(testRuns.id, runId))
      .run()
  })

  // Use waitUntil if available (Cloudflare Workers), otherwise fire-and-forget
  if (waitUntil) {
    waitUntil(promise)
  }
}

async function runTestSimulation(runId: string) {
  const db = useDatabase()

  const [run] = await db.select()
    .from(testRuns)
    .where(eq(testRuns.id, runId))
    .limit(1)

  if (!run) {
    throw new Error(`Run ${runId} not found`)
  }

  const config = run.config as TestRunConfig

  // Transition to running
  await db.update(testRuns)
    .set({
      status: 'running',
      startedAt: new Date(),
    })
    .where(eq(testRuns.id, runId))

  const durationSec = parseDuration(config.duration || '30s')
  const vus = config.vus

  // In Workers, we can't do long-running setTimeout loops.
  // Generate all metrics at once in a burst simulation.
  const totalTicks = Math.max(3, Math.min(15, Math.floor(durationSec / 2)))

  let totalReqs = 0
  let totalIterations = 0
  let totalFailed = 0
  let totalDataReceived = 0
  let totalDataSent = 0
  const durations: number[] = []

  for (let tick = 0; tick < totalTicks; tick++) {
    const rampFactor = Math.min(1, (tick + 1) / Math.max(1, totalTicks * 0.3))
    const activeVus = Math.floor(vus * rampFactor)
    const reqsThisTick = Math.floor(activeVus * (2 + Math.random() * 3))
    const avgDuration = 50 + Math.random() * 200
    const failRate = Math.random() * 0.03
    const failedThisTick = Math.floor(reqsThisTick * failRate)

    totalReqs += reqsThisTick
    totalIterations += Math.floor(reqsThisTick / 2)
    totalFailed += failedThisTick
    totalDataReceived += reqsThisTick * (5000 + Math.random() * 15000)
    totalDataSent += reqsThisTick * (500 + Math.random() * 2000)
    durations.push(avgDuration)

    const metricPoint: MetricDataPoint = {
      http_reqs: reqsThisTick,
      http_req_duration: avgDuration,
      http_req_failed: failedThisTick,
      vus: activeVus,
      iterations: Math.floor(reqsThisTick / 2),
    }

    await db.insert(testMetrics).values({
      id: nanoid(),
      runId,
      timestamp: new Date(Date.now() + tick * 2000), // Simulated 2s intervals
      data: metricPoint,
    })
  }

  const sortedDurations = [...durations].sort((a, b) => a - b)
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
  const p95Duration = sortedDurations[Math.floor(sortedDurations.length * 0.95)] || avgDuration
  const p99Duration = sortedDurations[Math.floor(sortedDurations.length * 0.99)] || p95Duration * 1.2

  const summary: TestMetricsSummary = {
    http_reqs: totalReqs,
    http_req_duration_avg: Math.round(avgDuration * 100) / 100,
    http_req_duration_p95: Math.round(p95Duration * 100) / 100,
    http_req_duration_p99: Math.round(p99Duration * 100) / 100,
    http_req_failed: totalFailed,
    data_received: Math.round(totalDataReceived),
    data_sent: Math.round(totalDataSent),
    iterations: totalIterations,
    vus_max: vus,
  }

  await db.update(testRuns)
    .set({
      status: 'completed',
      metrics: summary,
      completedAt: new Date(),
    })
    .where(eq(testRuns.id, runId))

  console.log(`[TestRunner] Run ${runId} completed: ${totalReqs} requests, avg ${Math.round(avgDuration)}ms`)
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h)$/)
  if (!match) return 30
  const value = parseInt(match[1]!)
  switch (match[2]) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 3600
    default: return 30
  }
}
