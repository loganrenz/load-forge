import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/requireAuth'
import { useDatabase, testScripts } from '../../../database'

const updateScriptSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  script: z.string().min(1).optional(),
  config: z.object({
    thresholds: z.record(z.array(z.string())).optional(),
    scenarios: z.record(z.unknown()).optional(),
  }).optional(),
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
  const result = updateScriptSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }
  
  // Verify ownership
  const [existing] = await db.select()
    .from(testScripts)
    .where(and(
      eq(testScripts.id, scriptId),
      eq(testScripts.userId, user.id)
    ))
    .limit(1)
  
  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Script not found',
    })
  }
  
  // Update script
  const [updated] = await db.update(testScripts)
    .set({
      ...result.data,
      updatedAt: new Date(),
    })
    .where(eq(testScripts.id, scriptId))
    .returning()
  
  return { script: updated }
})
