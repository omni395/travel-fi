import prisma from '~~/lib/prisma'
import { ethers } from 'ethers'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ message: string; signature: string }>(event)
  if (!body?.message || !body?.signature) throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })

  const nonce = getCookie(event, '__siwe-nonce')
  if (!nonce) throw createError({ statusCode: 400, statusMessage: 'Nonce missing' })

  // Very simplified SIWE-like verification
  let address: string
  try {
    const recovered = ethers.verifyMessage(body.message, body.signature)
    address = recovered.toLowerCase()
    if (!body.message.includes(address) || !body.message.includes(nonce)) throw new Error('Invalid message')
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  // Upsert user by wallet
  let user = await prisma.user.findFirst({ where: { walletAddress: address } })
  if (!user) {
    user = await prisma.user.create({ data: { email: `${address}@wallet`, walletAddress: address } })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  await prisma.session.create({ data: { id: crypto.randomUUID(), userId: user.id, token, expiresAt } })

  setCookie(event, '__Host-session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  })

  deleteCookie(event, '__siwe-nonce', { path: '/' })
  return { ok: true }
})


