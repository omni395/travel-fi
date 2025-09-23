import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, '__Host-session')
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
    deleteCookie(event, '__Host-session', { path: '/' })
  }
  return { ok: true }
})


