import { z } from 'zod'
import prisma from '~~/lib/prisma'
import { getCookie, createError } from 'h3'

const schema = z.object({
  code: z.string().length(6)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const resetToken = getCookie(event, '__reset-token')
  if (!resetToken) throw createError({ statusCode: 400, message: 'No reset token' })

  // Mock verify (in real: check code from email, stored in Session or Redis)
  // For test: assume code = '123456', token = email or userId
  if (validated.code !== '123456') throw createError({ statusCode: 400, message: 'Invalid code' })

  // Find user by reset token (stub: assume email from token or body)
  const email = 'stub-email' // Real: parse from token or body
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  await prisma.user.update({
    where: { id: user.id },
    data: { confirmedEmail: true }
  })

  deleteCookie(event, '__reset-token')

  return { ok: true }
})
