import prisma from '~/lib/prisma'
import { ACHIEVEMENTS, Achievement, UserStats } from '~/types/achievement'

export class AchievementService {
  private static instance: AchievementService

  private constructor() {}

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService()
    }
    return AchievementService.instance
  }

  private async getUserStats(userId: number): Promise<UserStats> {
    const [user, contributions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          points: true,
          emailVerified: true,
          walletAddress: true,
          _count: {
            select: {
              wifiPoints: true,
              reviews: true,
              securityReports: true
            }
          }
        }
      }),
      prisma.contribution.groupBy({
        by: ['type'],
        where: { userId },
        _count: true
      })
    ])

    if (!user) throw new Error('User not found')

    // Count unique cities and countries from wifi points
    const locations = await prisma.wifiPoint.groupBy({
      by: ['country', 'city'],
      where: { userId }
    })

    const uniqueCountries = new Set(locations.map(l => l.country)).size
    const uniqueCities = new Set(locations.map(l => `${l.country}-${l.city}`)).size

    // Get login streak
    const lastWeekSessions = await prisma.session.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    let loginStreak = 0
    const today = new Date().setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today - i * 24 * 60 * 60 * 1000)
      const hasLogin = lastWeekSessions.some(s => 
        s.createdAt.setHours(0, 0, 0, 0) === date.getTime()
      )
      if (!hasLogin) break
      loginStreak++
    }

    return {
      contributions: contributions.reduce((sum, c) => sum + c._count, 0),
      wifiPoints: user._count.wifiPoints,
      reviews: user._count.reviews,
      securityReports: user._count.securityReports,
      referrals: 0, // TODO: Implement referral tracking
      loginStreak,
      uniqueCities,
      uniqueCountries,
      totalPoints: user.points,
      verifiedEmail: user.emailVerified,
      hasWallet: !!user.walletAddress
    }
  }

  async checkAchievements(userId: number): Promise<Achievement[]> {
    const stats = await this.getUserStats(userId)
    
    // Get user's current achievements
    const userAchievements = await prisma.achievement.findMany({
      where: { userId }
    })
    const achieved = new Set(userAchievements.map(a => a.achievementId))

    // Check for new achievements
    const newAchievements = ACHIEVEMENTS.filter(achievement => 
      !achieved.has(achievement.id) && achievement.condition(stats)
    )

    if (newAchievements.length > 0) {
      // Record new achievements
      await prisma.$transaction(async (tx) => {
        for (const achievement of newAchievements) {
          await tx.achievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              points: achievement.points
            }
          })

          // Update user points
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: achievement.points } }
          })
        }
      })
    }

    return newAchievements
  }
}

export const achievementService = AchievementService.getInstance()