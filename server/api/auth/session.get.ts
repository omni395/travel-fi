import prisma from '~~/lib/prisma'
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

    const [userIdStr, role, expStr] = data.split(':')
    const userId = parseInt(userIdStr, 10)
    const exp = parseInt(expStr, 10)

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
})
