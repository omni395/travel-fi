import { z } from 'zod'
import prisma from '~~/lib/prisma'
import { getCookie, createError, deleteCookie, readBody, getHeader } from 'h3'
import { writeAudit } from '~/services/audit'

const schema = z.object({
  code: z.string().length(6)
})

function getIp(event: any) {
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return String(xff).split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || ''
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const resetToken = getCookie(event, '__reset-token')
  if (!resetToken) throw createError({ statusCode: 400, message: 'No reset token' })

  if (validated.code !== '123456') {
    await writeAudit({
      action: 'auth.verify_email_failed',
      targetType: 'Auth',
      result: 'failure',
      ipAddress: getIp(event),
      userAgent: getHeader(event, 'user-agent') || '',
      metadata: { reason: 'invalid_code' }
    })
    throw createError({ statusCode: 400, message: 'Invalid code' })
  }

  const email = 'stub-email'
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  await prisma.user.update({
    where: { id: user.id },
    data: { confirmedEmail: true }
  })

  deleteCookie(event, '__reset-token', { path: '/' })

  await writeAudit({
    userId: user.id,
    action: 'auth.verify_email',
    targetType: 'Auth',
    result: 'success',
    ipAddress: getIp(event),
    userAgent: getHeader(event, 'user-agent') || ''
  })

  return { ok: true }
})