import { z } from 'zod'
import prisma from '~~/lib/prisma'
import { ethers } from 'ethers'
import crypto from 'node:crypto'
import { getHeader, readBody, setCookie, createError, getCookie, deleteCookie } from 'h3'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  message: z.string(),
  signature: z.string()
})


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)

  const nonce = getCookie(event, '__siwe-nonce')
  if (!nonce) throw createError({ statusCode: 400, statusMessage: 'Nonce missing' })

  let address: string
  try {
    const recovered = ethers.verifyMessage(validated.message, validated.signature)
    address = recovered.toLowerCase()
    if (!validated.message.includes(address) || !validated.message.includes(nonce)) throw new Error('Invalid message')
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  // Проверяем текущую сессию
  const token = getCookie(event, 'auth-token')
  let sessionUser = null
  if (token) {
    // verifyToken из session.get.ts
    const [data, signature] = token.split('.')
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (signature === expectedSignature) {
      const [userIdStr, role, expStr] = data.split(':')
      const userId = parseInt(userIdStr, 10)
      const exp = parseInt(expStr, 10)
      if (!isNaN(userId) && exp * 1000 > Date.now()) {
        sessionUser = await prisma.user.findUnique({ where: { id: userId } })
      }
    }
  }

  let user
  if (sessionUser) {
    // Если пользователь авторизован — просто добавляем кошелёк
    user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: { walletAddress: address }
    })
  } else {
    // Если не авторизован — ищем по кошельку
    user = await prisma.user.findFirst({ where: { walletAddress: address } })
    if (!user) {
      user = await prisma.user.create({ data: { walletAddress: address } })
    }
  }

  // Rotate sessions
  await prisma.session.deleteMany({ where: { userId: user.id } })

  // JWT token
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  const newData = `${user.id}:user:${exp}`
  const newSignature = crypto.createHmac('sha256', SECRET).update(newData).digest('base64url')
  const newToken = `${newData}.${newSignature}`

  setCookie(event, 'auth-token', newToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30
  })

  deleteCookie(event, '__siwe-nonce', { path: '/' })
  return { ok: true }
})


