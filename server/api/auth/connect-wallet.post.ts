import { H3Event } from 'h3'
import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'
import { rewardService } from '~/services/reward.service'

export default defineEventHandler(async (event: H3Event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const { address } = await readBody(event)
  if (!address) {
    throw createError({
      statusCode: 400,
      message: 'Wallet address is required'
    })
  }

  // Проверяем, не привязан ли адрес к другому пользователю
  const existingUser = await prisma.user.findFirst({
    where: { 
      walletAddress: address,
      id: { not: user.id }
    }
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'This wallet is already connected to another account'
    })
  }

  try {
    // Конвертируем баллы в токены и сохраняем адрес
    await rewardService.convertPointsToTokens(user.id, address)

    return {
      success: true,
      message: 'Wallet connected successfully'
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to connect wallet'
    })
  }
})