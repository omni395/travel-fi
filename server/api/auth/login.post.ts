import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'
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
  }

  const email = body.email.toLowerCase().trim()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const match = await bcrypt.compare(body.password, user.password)
  if (!match) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // Generate token (stateless HMAC)
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60  // 7 days
  const data = `${user.id}:${user.role}:${exp}`
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const token = `${data}.${signature}`

  // Set cookie
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60
  })

  return { user: { id: user.id, role: user.role, email: user.email }, success: true }
})
