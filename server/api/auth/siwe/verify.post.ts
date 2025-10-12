import { z } from 'zod'
import prisma from '~~/lib/prisma'
import { ethers } from 'ethers'
import crypto from 'node:crypto'
import { getHeader, readBody, setCookie, createError, getCookie, deleteCookie } from 'h3'
import { writeAudit } from '~/services/audit'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

const schema = z.object({
  message: z.string(),
  signature: z.string()
})

function getIp(event: any) {
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return String(xff).split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || ''
}

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
    await writeAudit({ action: 'auth.siwe_failed', targetType: 'Auth', result: 'failure', ipAddress: getIp(event), userAgent: getHeader(event, 'user-agent') || '', metadata: { reason: 'invalid_signature' } })
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  const token = getCookie(event, 'auth-token')
  let sessionUser = null
  if (token) {
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
    user = await prisma.user.update({ where: { id: sessionUser.id }, data: { walletAddress: address } })
  } else {
    user = await prisma.user.findFirst({ where: { walletAddress: address } })
    if (!user) {
      user = await prisma.user.create({ data: { walletAddress: address } })
      await writeAudit({ userId: user.id, action: 'auth.siwe_register', targetType: 'Auth', result: 'success', ipAddress: getIp(event), userAgent: getHeader(event, 'user-agent') || '' })
    }
  }

  await prisma.session.deleteMany({ where: { userId: user.id } })

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  const newData = `${user.id}:user:${exp}`
  const newSignature = crypto.createHmac('sha256', SECRET).update(newData).digest('base64url')
  const newToken = `${newData}.${newSignature}`

  setCookie(event, 'auth-token', newToken, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 1000 * 60 * 60 * 24 * 30
  })

  deleteCookie(event, '__siwe-nonce', { path: '/' })

  await writeAudit({
    userId: user.id,
    action: 'auth.siwe_login',
    targetType: 'Auth',
    result: 'success',
    ipAddress: getIp(event),
    userAgent: getHeader(event, 'user-agent') || '',
    metadata: { walletAddress: user.walletAddress || address }
  })

  return { ok: true }
})