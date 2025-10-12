import { z } from 'zod'
import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { getHeader, readBody, setCookie, createError } from 'h3'
import { writeAudit } from '~/services/audit'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string()
})

function getIp(event: any) {
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return String(xff).split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || ''
}

export default defineEventHandler(async (event) => {
  console.log("🔐 POST /api/auth/login: Started")
  
  const body = await readBody(event)
  console.log("🔐 POST /api/auth/login: Request body received", { email: body.email })
  
  const validated = schema.parse(body)
  console.log("🔐 POST /api/auth/login: Validation passed")

  const user = await prisma.user.findUnique({ where: { email: validated.email } })
  console.log("🔐 POST /api/auth/login: User lookup result", { found: !!user, hasPassword: !!user?.password })

  if (!user || !user.password) {
    await writeAudit({
      action: 'auth.login_failed',
      targetType: 'Auth',
      result: 'failure',
      ipAddress: getIp(event),
      userAgent: getRequestHeader(event, 'user-agent') || '',
      metadata: { email: validated.email, reason: 'user_or_password_missing' }
    })
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const match = await bcrypt.compare(validated.password, user.password)
  if (!match) {
    await writeAudit({
      userId: user.id,
      action: 'auth.login_failed',
      targetType: 'Auth',
      result: 'failure',
      ipAddress: getIp(event),
      userAgent: getRequestHeader(event, 'user-agent') || '',
      metadata: { reason: 'password_mismatch' }
    })
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Удаляем старые сессии
  await prisma.session.deleteMany({ where: { userId: user.id } })

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  const data = `${user.id}:${user.role}:${exp}`
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const token = `${data}.${signature}`

  // Создаем новую сессию в базе данных
  await prisma.session.create({
    data: {
      userId: user.id,
      token: token,
      userAgent: getHeader(event, 'user-agent') || '',
      ipAddress: getIp(event),
      isActive: true,
      expiresAt: new Date(exp * 1000)
    }
  })

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30
  })
  console.log("🔐 POST /api/auth/login: Cookie set")

  await writeAudit({
    userId: user.id,
    action: 'auth.login',
    targetType: 'Auth',
    result: 'success',
    ipAddress: getIp(event),
    userAgent: getHeader(event, 'user-agent') || ''
  })
  console.log("🔐 POST /api/auth/login: Audit log written")

  console.log("🔐 POST /api/auth/login: Success, returning response")
  return { ok: true, userId: user.id, role: user.role }
})