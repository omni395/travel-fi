import crypto from 'node:crypto'
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