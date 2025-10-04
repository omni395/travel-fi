import crypto from 'node:crypto'
<<<<<<< HEAD
import { getCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  // Генерируем новый CSRF токен если нет или истёк (простой in-memory, для prod используй Redis)
  let csrfToken = getCookie(event, 'csrf-token')
  if (!csrfToken) {
    csrfToken = crypto.randomUUID()
    setCookie(event, 'csrf-token', csrfToken, {
      httpOnly: false, // Должен быть readable JS для отправки в header
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10 // 10 минут
    })
  }
  return { csrfToken }
})
=======
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
>>>>>>> authentication
