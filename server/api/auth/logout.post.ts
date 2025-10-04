import prisma from '~~/lib/prisma'
<<<<<<< HEAD
import { getCookie, deleteCookie, defineEventHandler } from 'h3'
import crypto from 'node:crypto'

const SECRET = useRuntimeConfig().secret || 'fallback-secret-change-in-prod'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')
  if (!token) {
    return { success: true }  // Already logged out
  }

  try {
    // Always delete cookie first
    deleteCookie(event, 'auth-token', { 
      path: '/', 
      maxAge: 0, 
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    console.log('Deleted auth-token cookie')

    if (!token.includes('.')) {
      console.log('Invalid token format, skipping DB cleanup')
      return { success: true }
    }

    const [data, signature] = token.split('.')
    if (!data || !signature) {
      console.log('Invalid token structure')
      return { success: true }
    }

    // Verify HMAC if possible
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (signature !== expectedSignature) {
      console.log('Invalid signature, skipping DB cleanup')
      return { success: true }
    }

    const [userIdStr, role, expStr] = data.split(':')
    const userId = parseInt(userIdStr, 10)
    const exp = parseInt(expStr, 10)

    // Even if expired, delete session if exists
    await prisma.session.deleteMany({
      where: { token }
    })
    console.log('Deleted session from DB for token:', token)

    return { success: true }
  } catch (err) {
    console.error('Logout error:', err)
    // Still delete cookie on error
    deleteCookie(event, 'auth-token', { 
      path: '/', 
      maxAge: 0, 
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    return { success: false, error: 'Logout failed' }
=======
import { getCookie, deleteCookie } from 'h3'
import crypto from 'node:crypto'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

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
  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      await prisma.session.deleteMany({ where: { userId: payload.userId } })
    }
    deleteCookie(event, 'auth-token', { path: '/' })
>>>>>>> authentication
  }
})


