import { z } from 'zod'
import prisma from '~/lib/prisma'
import { getUser } from '~/server/utils/session'

// Валидация входящих данных
const settingsSchema = z.object({
  rewardWifiPoints: z.number().min(0),
  rewardSecurity: z.number().min(0),
  rewardReview: z.number().min(0),
  rewardEsim: z.number().min(0),
  pointsWifiPoints: z.number().min(0),
  pointsSecurity: z.number().min(0),
  pointsReview: z.number().min(0),
  pointsEsim: z.number().min(0),
  weeklyRewardLimit: z.number().min(0),
  weeklyPointsLimit: z.number().min(0),
  weeklyTokensLimit: z.number().min(0)
})

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user?.isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden'
    })
  }

  const body = await readBody(event)
  const settings = settingsSchema.parse(body)

  // Обновляем все настройки в одной транзакции
  await prisma.$transaction(async (tx) => {
    for (const [key, value] of Object.entries(settings)) {
      await tx.adminSetting.upsert({
        where: { key },
        update: { value: value.toString() },
        create: { key, value: value.toString() }
      })
    }
  })

  return { success: true }
})