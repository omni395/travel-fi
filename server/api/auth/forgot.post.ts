import prisma from '~~/lib/prisma'
import crypto from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event)
  if (!body?.email) throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })

  const email = body.email.toLowerCase().trim()
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    // store one-time reset token in Session table (or separate table in future)
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 min
    await prisma.session.create({ data: { id: crypto.randomUUID(), userId: user.id, token, expiresAt } })
    // TODO: send email with magic link `/auth/reset?token=...` (будет реализовано позже)
  }
  // Always return ok to avoid user enumeration
  return { ok: true }
})


