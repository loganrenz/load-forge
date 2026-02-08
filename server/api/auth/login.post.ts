import { z } from 'zod'
import { verifyCredentials, createSession } from '../../utils/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message || 'Validation error',
    })
  }
  
  const { email, password } = result.data
  
  // Verify credentials
  const user = await verifyCredentials(email, password)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  }
  
  // Create session
  const sessionId = await createSession(user.id)
  
  // Set session cookie
  setCookie(event, 'session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  }
})
