import { z } from 'zod'
import { createUser, getUserByEmail, createSession } from '../../utils/auth'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate input
  const result = signupSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }
  
  const { email, password, name } = result.data
  
  // Check if user already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'An account with this email already exists',
    })
  }
  
  // Create user
  const user = await createUser(email, password, name)
  
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
