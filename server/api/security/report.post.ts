import { defineEventHandler, createError, readBody } from 'h3'
import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'
import { rewardService } from '~/services/reward.service'
import { z } from 'zod'

const securityReportSchema = z.object({
  wifiPointId: z.number(),
  risks: z.string().min(10).max(500),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const body = await readBody(event)
  const data = securityReportSchema.parse(body)

  // Проверяем существование Wi-Fi точки
  const wifiPoint = await prisma.wifiPoint.findUnique({
    where: { id: data.wifiPointId }
  })
  if (!wifiPoint) throw createError({ statusCode: 404, message: 'Wi-Fi point not found' })

  // Проверяем не оставлял ли пользователь уже отчет
  const existingReport = await prisma.securityReport.findFirst({
    where: {
      wifiPointId: data.wifiPointId,
      userId: user.id
    }
  })
  if (existingReport) {
    throw createError({ statusCode: 400, message: 'You have already reported this Wi-Fi point' })
  }

  // Создаем отчет и начисляем награду
  const report = await prisma.securityReport.create({
    data: {
      ...data,
      userId: user.id
    }
  })

  // Начисляем награду
  const reward = await rewardService.rewardSecurityReport(user.id, report.id)

  return { 
    success: true, 
    data: report,
    reward
  }
})