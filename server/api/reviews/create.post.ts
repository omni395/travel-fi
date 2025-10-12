import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/lib/prisma'
import { getUser } from '~/server/utils/session'
import { rewardService } from '~/services/reward.service'
import { z } from 'zod'

const reviewSchema = z.object({
  targetId: z.number(),
  targetType: z.enum(['wifi', 'esim']),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const data = reviewSchema.parse(body)

  // Проверяем существование цели отзыва
  if (data.targetType === 'wifi') {
    const wifiPoint = await prisma.wifiPoint.findUnique({
      where: { id: data.targetId }
    })
    if (!wifiPoint) throw createError({ statusCode: 404, message: 'Wi-Fi point not found' })
  } else {
    const esim = await prisma.esimTariff.findUnique({
      where: { id: data.targetId }
    })
    if (!esim) throw createError({ statusCode: 404, message: 'eSIM tariff not found' })
  }

  // Проверяем не оставлял ли пользователь уже отзыв
  const existingReview = await prisma.review.findFirst({
    where: {
      targetId: data.targetId,
      targetType: data.targetType,
      userId: user.id
    }
  })
  if (existingReview) {
    throw createError({ statusCode: 400, message: 'You have already reviewed this item' })
  }

  // Создаем отзыв и начисляем награду
  const review = await prisma.review.create({
    data: {
      ...data,
      userId: user.id
    }
  })

  // Начисляем награду
  const reward = await rewardService.rewardReview(user.id)

  return { 
    success: true, 
    data: review,
    reward
  }
})