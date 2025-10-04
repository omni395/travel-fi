import { z } from 'zod'
import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'
<<<<<<< HEAD
import { getCookie, getHeader } from 'h3'
import * as crypto from 'crypto'
import EmailService from '~~/server/services/email.service'

const rateMap = new Map<string, { count: number; last: number }>()

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
  if (!body?.email || !body?.password || body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }
=======
import crypto from 'node:crypto'
import { setCookie, createError, getCookie, deleteCookie } from 'h3'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)
>>>>>>> authentication

  const exists = await prisma.user.findUnique({ where: { email: validated.email } })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'User exists' })

  const saltRounds = 12
<<<<<<< HEAD
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  const confirmationToken = crypto.randomUUID()
  const user = await prisma.user.create({ 
    data: { 
      email, 
      password: passwordHash, 
      confirmationToken 
    } as any 
=======
  const passwordHash = await bcrypt.hash(validated.password, saltRounds)
  const user = await prisma.user.create({ data: { email: validated.email, password: passwordHash, confirmedEmail: false } })

  // Rotate sessions
  await prisma.session.deleteMany({ where: { userId: user.id } })

  // JWT token
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  const data = `${user.id}:user:${exp}`
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const token = `${data}.${signature}`

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30
>>>>>>> authentication
  })

  try {
    await EmailService.sendConfirmationEmail(email, confirmationToken, undefined)
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    // Не сбрасываем пользователя, email будет отправлен позже
  }

  return { ok: true, message: 'Registration successful. Please check your email to confirm your account.' }
})
