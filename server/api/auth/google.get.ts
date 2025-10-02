import type { H3Event } from 'h3'
import prisma from '~~/lib/prisma'
import crypto from 'crypto'
import { setCookie, sendRedirect } from 'h3'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event: H3Event, { user }: { user: any }) {
    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email } as any
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name || user.email.split('@')[0],
          confirmedEmail: true,
        } as any
      })
    }

    return sendRedirect(event, '/dashboard')
  },
  onError(event: H3Event, error: any) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=oauth_failed')
  }
})