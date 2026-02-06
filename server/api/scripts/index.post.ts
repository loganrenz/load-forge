import { z } from 'zod'
import { nanoid } from 'nanoid'
import { requireAuth } from '../../utils/requireAuth'
import { useDatabase, testScripts } from '../../database'

const createScriptSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  script: z.string().min(1, 'Script content is required'),
  config: z.object({
    thresholds: z.record(z.array(z.string())).optional(),
    scenarios: z.record(z.unknown()).optional(),
  }).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const db = useDatabase()
  
  // Validate input
  const result = createScriptSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }
  
  const { name, description, script, config } = result.data
  
  // Create script
  const [newScript] = await db.insert(testScripts).values({
    id: nanoid(),
    userId: user.id,
    name,
    description,
    script,
    config: config || {},
  }).returning()
  
  return { script: newScript }
})
