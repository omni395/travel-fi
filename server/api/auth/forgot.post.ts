import prisma from '~~/lib/prisma'
import crypto from 'node:crypto'
import EmailService from '~~/server/services/email.service'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event)
  if (!body?.email) throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })

  const email = body.email.toLowerCase().trim()
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    // store one-time reset token in Session table (or separate table in future)
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 min
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

    try {
      await EmailService.sendPasswordResetEmail(email, token)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      // Продолжаем, email будет отправлен позже
    }
  }
  // Always return ok to avoid user enumeration
  return { ok: true }
})
