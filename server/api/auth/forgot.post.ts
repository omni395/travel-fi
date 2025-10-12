import { z } from 'zod'
import prisma from '~~/lib/prisma'
import crypto from 'node:crypto'
import { setCookie, readBody, getHeader } from 'h3'
import { writeAudit } from '~/services/audit'

const schema = z.object({
  email: z.string().email().toLowerCase().trim()
})

function getIp(event: any) {
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return String(xff).split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || ''
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const user = await prisma.user.findUnique({ where: { email: validated.email } })
  if (user) {
    const token = crypto.randomUUID()
    await prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 1000*60*30) } })
    setCookie(event, '__reset-token', token, { httpOnly: true, maxAge: 1000 * 60 * 30, path: '/' })
    await writeAudit({
      userId: user.id,
      action: 'auth.forgot_request',
      targetType: 'Auth',
      result: 'success',
      ipAddress: getIp(event),
      userAgent: getHeader(event, 'user-agent') || '',
      metadata: { tokenIssued: true }
    })
  } else {
    await writeAudit({
      action: 'auth.forgot_request',
      targetType: 'Auth',
      result: 'success',
      ipAddress: getIp(event),
      userAgent: getHeader(event, 'user-agent') || '',
      metadata: { email: validated.email, userFound: false }
    })
  }
  return { ok: true }
})