import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'
import { getUserReputation } from '~/server/services/reputation.service'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  try {
    const [
      contributions,
      reviews,
      wifiPoints,
      sessions,
      recentContributions,
      features,
      reputation,
      votes
    ] = await Promise.all([
      prisma.contribution.count({ where: { userId: user.id } }),
      prisma.review.count({ where: { userId: user.id } }),
      prisma.wifiPoint.count({ where: { userId: user.id } }),
      prisma.session.count({ where: { userId: user.id } }),
      prisma.contribution.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.userFeature.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      }),
      getUserReputation(user.id),
      prisma.vote.count({ where: { userId: user.id } })
    ])

    return {
      contributions,
      reviews,
      wifiPoints,
      sessions,
      recentContributions,
      features,
      reputation: reputation.reputation,
      level: reputation.level,
      totalVotes: votes
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user stats'
    })
  }
})