import prisma from '~~/lib/prisma'
<<<<<<< HEAD
import { getCookie, deleteCookie, defineEventHandler } from 'h3'
import crypto from 'node:crypto'

const SECRET = useRuntimeConfig().secret || 'fallback-secret-change-in-prod'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')
  if (!token) {
    return { user: null, session: null }
  }

  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) {
      return { user: null, session: null }
    }

    // Verify HMAC
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (signature !== expectedSignature) {
      deleteCookie(event, 'auth-token')
      return { user: null, session: null }
    }
=======
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
>>>>>>> authentication

    const [userIdStr, role, expStr] = data.split(':')
    const userId = parseInt(userIdStr, 10)
    const exp = parseInt(expStr, 10)

<<<<<<< HEAD
    if (exp < Math.floor(Date.now() / 1000)) {
      deleteCookie(event, 'auth-token')
      return { user: null, session: null }
    }

    // Find user in DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, points: true, badges: true, walletAddress: true, leaderboardRank: true }
    })

    if (!user || user.role !== role) {
      deleteCookie(event, 'auth-token')
      return { user: null, session: null }
    }

    // Upsert session in DB
    const session = await prisma.session.upsert({
      where: { token },
      update: { lastActivity: new Date(), isActive: true },
      create: { 
        userId, 
        token, 
        isActive: true, 
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      }
    })

    return { 
      user, 
      session: { 
        id: session.id, 
        expiresAt: session.expiresAt, 
        isActive: true 
      } 
    }
  } catch (err) {
    console.error('Session verify error:', err)
    return { user: null, session: null }
  }
=======
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
>>>>>>> authentication
})
