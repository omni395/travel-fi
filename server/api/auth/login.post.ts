import { z } from 'zod'
import prisma from '~~/lib/prisma'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { getHeader, readBody, setCookie, createError } from 'h3'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  console.log('Login attempt for email:', validated.email)

  const user = await prisma.user.findUnique({ where: { email: validated.email } })
  console.log('User found:', !!user, user ? user.id : 'null')

  if (!user || !user.password) {
    console.log('401: No user or no password')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const match = await bcrypt.compare(validated.password, user.password)
  console.log('Password match:', match)

  if (!match) {
    console.log('401: Password mismatch')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Rotate: delete old sessions (if any)
  await prisma.session.deleteMany({ where: { userId: user.id } })

  // Create JWT token
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30  // 30 days
  const data = `${user.id}:${user.role}:${exp}`  // userId:role:exp
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const token = `${data}.${signature}`

  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30  // 30 days
  })

  console.log('Login success for user ID:', user.id)
  return { ok: true }
})


