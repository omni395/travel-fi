import type { H3Event } from 'h3'
import prisma from '~~/lib/prisma'
import crypto from 'crypto'
import { setCookie, sendRedirect, getHeader } from 'h3'
import { writeAudit } from '~/services/audit'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

function getIp(event: any) {
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return String(xff).split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || ''
}

export default defineOAuthGoogleEventHandler({
  async onSuccess(event: H3Event, { user }: { user: any }) {
    const { email, picture, name } = user

    let dbUser = await prisma.user.findUnique({ where: { email } as any })

    // Имя: если нет, берем часть email до @
    const userName = name && name.trim().length > 0 ? name : email.split('@')[0]

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          profilePicture: picture,
          confirmedEmail: true,
          name: userName,
        } as any
      })
      await writeAudit({ userId: dbUser.id, action: 'auth.google_register', targetType: 'Auth', result: 'success', ipAddress: getIp(event), userAgent: getHeader(event, 'user-agent') || '' })
    } else {
      // Если имя не заполнено, обновить
      if (!dbUser.name || dbUser.name.trim().length === 0) {
        await prisma.user.update({ where: { id: dbUser.id }, data: { name: userName } })
      }
      // Если аватар не заполнен, обновить
      if (!dbUser.profilePicture) {
        await prisma.user.update({ where: { id: dbUser.id }, data: { profilePicture: picture } })
      }
    }

    await prisma.session.deleteMany({ where: { userId: dbUser.id } })

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
    const data = `${dbUser.id}:user:${exp}`
    const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    const token = `${data}.${signature}`

    setCookie(event, 'auth-token', token, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 1000 * 60 * 60 * 24 * 30
    })

    await writeAudit({ userId: dbUser.id, action: 'auth.google_login', targetType: 'Auth', result: 'success', ipAddress: getIp(event), userAgent: getHeader(event, 'user-agent') || '' })

    return sendRedirect(event, '/dashboard')
  },
  onError(event: H3Event, error: any) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=oauth_failed')
  }
})