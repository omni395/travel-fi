import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'
import { getUser } from '~/server/utils/session'
import { rewardService } from '~/services/reward.service'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { id } = event.context.params || {}
  if (!id) throw createError({ statusCode: 400, message: 'Missing review ID' })

  const review = await prisma.review.findUnique({
    where: { id: parseInt(id) }
  })
  if (!review) throw createError({ statusCode: 404, message: 'Review not found' })

  // Отзыв можно удалить только автору или админу
  if (review.userId !== user.id && !user.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  await prisma.$transaction(async (tx) => {
    // Удаляем отзыв
    await tx.review.delete({ where: { id: parseInt(id) } })
    
    // Отменяем награду
    await rewardService.revokeReview(review.userId)
  })

  return { success: true }
})