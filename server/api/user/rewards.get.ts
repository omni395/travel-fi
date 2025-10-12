import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // Получаем статистику за последнюю неделю
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [contributions, tokenTxs] = await Promise.all([
    prisma.contribution.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo }
      }
    }),
    prisma.tokenTransaction.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
        status: 'completed'
      }
    })
  ])

  const [limits, stats] = await Promise.all([
    // Получаем лимиты из настроек
    prisma.adminSetting.findMany({
      where: {
        key: {
          in: ['weeklyPointsLimit', 'weeklyTokensLimit']
        }
      }
    }),
    // Получаем общую статистику пользователя
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        points: true,
        walletAddress: true,
        _count: {
          select: {
            contributions: true,
            reviews: true,
            wifiPoints: true,
            securityReports: true
          }
        }
      }
    })
  ])

  // Считаем полученные за неделю награды
  const weeklyPoints = contributions.reduce((sum, c) => sum + c.points, 0)
  const weeklyTokens = tokenTxs.reduce((sum, tx) => sum + Number(tx.amount), 0)

  // Конвертируем настройки в объект
  const settingsMap = limits.reduce<Record<string, number>>((acc, setting) => {
    acc[setting.key] = Number(setting.value)
    return acc
  }, {})

  return {
    data: {
      weekly: {
        points: weeklyPoints,
        tokens: weeklyTokens,
        pointsLimit: settingsMap.weeklyPointsLimit || 1000,
        tokensLimit: settingsMap.weeklyTokensLimit || 50,
        pointsRemaining: Math.max(0, (settingsMap.weeklyPointsLimit || 1000) - weeklyPoints),
        tokensRemaining: Math.max(0, (settingsMap.weeklyTokensLimit || 50) - weeklyTokens)
      },
      total: {
        points: stats?.points || 0,
        contributions: stats?._count.contributions || 0,
        reviews: stats?._count.reviews || 0,
        wifiPoints: stats?._count.wifiPoints || 0,
        securityReports: stats?._count.securityReports || 0
      },
      hasWallet: !!stats?.walletAddress
    }
  }
})