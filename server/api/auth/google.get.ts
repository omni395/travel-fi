import type { H3Event } from 'h3'
import prisma from '~~/lib/prisma'
import crypto from 'crypto'
import { setCookie, sendRedirect } from 'h3'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event: H3Event, { user }: { user: any }) {
    const { email, picture } = user

    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { email } as any
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          profilePicture: picture,
          confirmedEmail: true,
        } as any
      })
    } else if (!dbUser.profilePicture) {
      await prisma.user.update({ where: { id: dbUser.id }, data: { profilePicture: picture } })
    }

    // Rotate sessions
    await prisma.session.deleteMany({ where: { userId: dbUser.id } })

    // JWT token
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
    const data = `${dbUser.id}:user:${exp}`
    const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    const token = `${data}.${signature}`

    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30
    })

    return sendRedirect(event, '/dashboard')
  },
  onError(event: H3Event, error: any) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=oauth_failed')
  }
})
