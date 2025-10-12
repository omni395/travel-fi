import { z } from 'zod'
import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { setCookie, createError, getHeader, readBody } from 'h3'
import { writeAudit } from '~/services/audit'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8)
})

function getIp(event: any) {
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return String(xff).split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || ''
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const exists = await prisma.user.findUnique({ where: { email: validated.email } })
  if (exists) {
    await writeAudit({
      action: 'auth.register_failed',
      targetType: 'Auth',
      result: 'failure',
      ipAddress: getIp(event),
      userAgent: getHeader(event, 'user-agent') || '',
      metadata: { email: validated.email, reason: 'email_exists' }
    })
    throw createError({ statusCode: 409, statusMessage: 'User exists' })
  }

  const saltRounds = 12
  const passwordHash = await bcrypt.hash(validated.password, saltRounds)
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      password: passwordHash,
      confirmedEmail: false
    }
  })

  await prisma.session.deleteMany({ where: { userId: user.id } })

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
  })

  await writeAudit({
    userId: user.id,
    action: 'auth.register',
    targetType: 'Auth',
    result: 'success',
    ipAddress: getIp(event),
    userAgent: getHeader(event, 'user-agent') || ''
  })

  return { ok: true }
})