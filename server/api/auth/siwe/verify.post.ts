import prisma from '~/lib/prisma'
import { ethers } from 'ethers'

import { createError, getCookie, deleteCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ message: string; signature: string }>(event)
  if (!body?.message || !body?.signature) throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })

  const nonce = getCookie(event, '__siwe-nonce')
  if (!nonce) throw createError({ statusCode: 400, statusMessage: 'Nonce missing' })

  // Very simplified SIWE-like verification
  let address: string

  const mockMode = process.env.NODE_ENV === 'development' && process.env.MOCK_METAMASK === 'true'
  if (mockMode) {
    // Mock wallet address for dev testing
    address = '0x742d35Cc649Ab1d3D2686d1B4d8BB165F6A7E2C4'.toLowerCase()
    // In mock mode, skip real verification but check if message includes mock address and nonce
    if (!body.message.includes(address) || !body.message.includes(nonce)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid mock message' })
    }
  } else {
    try {
      const recovered = ethers.verifyMessage(body.message, body.signature)
      address = recovered.toLowerCase()
      if (!body.message.includes(address) || !body.message.includes(nonce)) throw new Error('Invalid message')
    } catch {
      throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }
  }

  // Upsert user by wallet
  let user = await prisma.user.findFirst({ where: { walletAddress: address } })
  if (!user) {
    user = await prisma.user.create({ 
    data: { 
      walletAddress: address, 
      email: `${address.toLowerCase()}@metamask.example.com`, 
      name: 'Metamask User',
      role: 'user' 
    } as any
  })
  }

  const sessionData = {
    user: {
      id: user.id,
      email: user.email,
      name: (user as any).name,
      role: user.role,
      points: user.points || 0,
      walletAddress: user.walletAddress
    }
  }

  setCookie(event, 'auth:session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  deleteCookie(event, '__siwe-nonce', { path: '/' })
  return { ok: true }
})


