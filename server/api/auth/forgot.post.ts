import { z } from 'zod'
import prisma from '~~/lib/prisma'
import crypto from 'node:crypto'
import EmailService from '~~/server/services/email.service'

const schema = z.object({
  email: z.string().email().toLowerCase().trim()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const user = await prisma.user.findUnique({ where: { email: validated.email } })
  if (user) {
    const token = crypto.randomUUID()
<<<<<<< HEAD
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 min
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

    try {
      await EmailService.sendPasswordResetEmail(email, token)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      // Продолжаем, email будет отправлен позже
    }
=======
    await prisma.session.create({ data: { userId: user.id, token } })
    // TODO: send email with magic link `/auth/reset?token=${token}` (expires in cookie 30 min)
    setCookie(event, '__reset-token', token, { httpOnly: true, maxAge: 1000 * 60 * 30 }) // 30 min for reset
>>>>>>> authentication
  }
  // Always return ok to avoid enumeration
  return { ok: true }
})
