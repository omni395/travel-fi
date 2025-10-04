import { z } from 'zod'
import prisma from '~~/lib/prisma'
import { getCookie, createError } from 'h3'
import crypto from 'node:crypto'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  field: z.enum(['email', 'name', 'profilePicture', 'walletAddress']),
  value: z.string(),
  _csrf: z.string()
})

function verifyToken(token) {
  try {
    const [data, signature] = token.split('.')
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (signature !== expectedSignature) return null
    const [userIdStr] = data.split(':')
    const userId = parseInt(userIdStr, 10)
    if (isNaN(userId)) return null
    return userId
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { field, value, _csrf } = schema.parse(body)
  // CSRF проверка (можно доработать)
  if (!_csrf) throw createError({ statusCode: 403, statusMessage: 'CSRF missing' })

  const token = getCookie(event, 'auth-token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const userId = verifyToken(token)
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  // Проверка уникальности email/walletAddress
  if (field === 'email' && value) {
    const exists = await prisma.user.findFirst({ where: { email: value, NOT: { id: userId } } })
    if (exists) throw createError({ statusCode: 409, statusMessage: 'Email already exists' })
  }
  if (field === 'walletAddress' && value) {
    const exists = await prisma.user.findFirst({ where: { walletAddress: value, NOT: { id: userId } } })
    if (exists) throw createError({ statusCode: 409, statusMessage: 'Wallet already exists' })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { [field]: value }
  })

  return { ok: true }
})
