import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'
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

  const email = body.email.toLowerCase().trim()
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'User exists' })

  const saltRounds = 12
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  const confirmationToken = crypto.randomUUID()
  const user = await prisma.user.create({ 
    data: { 
      email, 
      password: passwordHash, 
      confirmationToken 
    } as any 
  })

  try {
    await EmailService.sendConfirmationEmail(email, confirmationToken, undefined)
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    // Не сбрасываем пользователя, email будет отправлен позже
  }

  return { ok: true, message: 'Registration successful. Please check your email to confirm your account.' }
})
