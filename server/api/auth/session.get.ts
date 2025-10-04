import prisma from '~~/lib/prisma'
import { getCookie, createError } from 'h3'
import crypto from 'node:crypto'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

// verifyToken function (from middleware)
function verifyToken(token: string): { userId: number; role: string; exp: number } | null {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null

    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (signature !== expectedSignature) return null

    const [userIdStr, role, expStr] = data.split(':')
    const userId = parseInt(userIdStr, 10)
    const exp = parseInt(expStr, 10)

    if (isNaN(userId) || !role || isNaN(exp) || exp * 1000 < Date.now()) return null

    return { userId, role, exp }
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')
  if (!token) {
    return { user: null }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { user: null }
  }

  const sessionUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      confirmedEmail: true,
      walletAddress: true,
      points: true,
      role: true,
      referralCode: true,
      pushEnabled: true,
      lastLocation: true,
      language: true,
      travelPreferences: true,
      badges: true,
      leaderboardRank: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!sessionUser) {
    return { user: null }
  }

  return { user: sessionUser }
})
