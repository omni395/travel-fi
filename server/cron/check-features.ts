import { defineCronHandler } from '#nuxt/cron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineCronHandler('daily', async () => {
  try {
    const now = new Date()
    
    // Деактивируем просроченные фичи
    const result = await prisma.userFeature.updateMany({
      where: {
        expiresAt: { not: null, lte: now },
        isActive: true
      },
      data: { 
        isActive: false,
        updatedAt: now
      }
    })

    return { 
      success: true, 
      deactivatedCount: result.count,
      timestamp: now.toISOString()
    }
  } catch (error) {
    console.error('Ошибка в cron-задаче check-features:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
})
