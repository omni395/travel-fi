export default defineEventHandler(async (event) => {
  // Short lifetime nonce; for simplicity return random UUID
  const nonce = crypto.randomUUID()
  // In production, store nonce in short-lived storage tied to IP/session
  setCookie(event, '__siwe-nonce', nonce, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 300 })
  return { nonce }
})


