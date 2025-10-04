import { z } from 'zod'
import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'
<<<<<<< HEAD
import { getCookie, getHeader, defineEventHandler, setCookie, readBody } from 'h3'
import crypto from 'node:crypto'

const rateMap = new Map<string, { count: number; last: number }>()
const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) || 'unknown'
  const now = Date.now()
  const limit = 5
  const windowMs = 60 * 1000 // 1 minute

  let record = rateMap.get(ip)
  if (!record) {
    record = { count: 0, last: now }
    rateMap.set(ip, record)
  }

  if (now - record.last < windowMs) {
    record.count++
    if (record.count > limit) {
      throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
    }
  } else {
    record.count = 1
    record.last = now
  }

  // CSRF validation
  const csrfCookie = getCookie(event, 'csrf-token')
  const csrfHeader = getHeader(event, 'X-CSRF-Token')
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody<{ email: string; password: string }>(event)
  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
=======
import crypto from 'node:crypto'
import { getHeader, readBody, setCookie, createError } from 'h3'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  console.log('Login attempt for email:', validated.email)

  const user = await prisma.user.findUnique({ where: { email: validated.email } })
  console.log('User found:', !!user, user ? user.id : 'null')

  if (!user || !user.password) {
    console.log('401: No user or no password')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
>>>>>>> authentication
  }

  const match = await bcrypt.compare(validated.password, user.password)
  console.log('Password match:', match)

  if (!match) {
    console.log('401: Password mismatch')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

<<<<<<< HEAD
  // Generate token (stateless HMAC)
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60  // 7 days
  const data = `${user.id}:${user.role}:${exp}`
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const token = `${data}.${signature}`

  // Set cookie
=======
  // Rotate: delete old sessions (if any)
  await prisma.session.deleteMany({ where: { userId: user.id } })

  // Create JWT token
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30  // 30 days
  const data = `${user.id}:user:${exp}`  // userId:role:exp
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const token = `${data}.${signature}`

>>>>>>> authentication
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
<<<<<<< HEAD
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60
  })

  return { user: { id: user.id, role: user.role, email: user.email }, success: true }
=======
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30  // 30 days
  })

  console.log('Login success for user ID:', user.id)
  return { ok: true }
>>>>>>> authentication
})
