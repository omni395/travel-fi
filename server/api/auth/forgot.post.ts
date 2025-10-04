import { z } from 'zod'
import prisma from '~~/lib/prisma'
import crypto from 'node:crypto'

const schema = z.object({
  email: z.string().email().toLowerCase().trim()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const user = await prisma.user.findUnique({ where: { email: validated.email } })
  if (user) {
    const token = crypto.randomUUID()
    await prisma.session.create({ data: { userId: user.id, token } })
    // TODO: send email with magic link `/auth/reset?token=${token}` (expires in cookie 30 min)
    setCookie(event, '__reset-token', token, { httpOnly: true, maxAge: 1000 * 60 * 30 }) // 30 min for reset
  }
  // Always return ok to avoid enumeration
  return { ok: true }
})


