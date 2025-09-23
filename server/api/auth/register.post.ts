import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)
  if (!body?.email || !body?.password || body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const email = body.email.toLowerCase().trim()
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'User exists' })

  const saltRounds = 12
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  const user = await prisma.user.create({ data: { email, password: passwordHash } })

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  await prisma.session.create({ data: { id: crypto.randomUUID(), userId: user.id, token, expiresAt } })

  setCookie(event, '__Host-session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  })

  return { ok: true }
})


