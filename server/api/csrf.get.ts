import crypto from 'node:crypto'
import { setCookie } from 'h3'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

export default defineEventHandler(async (event) => {
  const csrfToken = crypto.randomUUID()
  const signature = crypto.createHmac('sha256', SECRET).update(csrfToken).digest('base64url')
  const fullToken = `${csrfToken}.${signature}`

  setCookie(event, 'csrf-token', fullToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600  // 1 hour
  })

  return { csrf: csrfToken }  // Frontend использует в body._csrf или header x-csrf-token
})
