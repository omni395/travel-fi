import { defineEventHandler, createError } from 'h3'
import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'
import { rewardService } from '~/services/reward.service'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { id } = event.context.params || {}
  if (!id) throw createError({ statusCode: 400, message: 'Missing report ID' })

  const report = await prisma.securityReport.findUnique({
    where: { id: parseInt(id) }
  })
  if (!report) throw createError({ statusCode: 404, message: 'Security report not found' })

  // Отчет может удалить только автор или админ

  if (report.userId !== user.id && !user.isAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  await prisma.$transaction(async (tx) => {
    // Удаляем отчет
    await tx.securityReport.delete({ where: { id: parseInt(id) } })
    
    // Отменяем награду
    await rewardService.revokeSecurityReport(report.userId, report.id)
  })

  return { success: true }
})