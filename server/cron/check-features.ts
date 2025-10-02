import { defineCronHandler } from '#nuxt/cron'
import { PrismaClient } from '@prisma/client'
import { FeatureService } from '~/server/services/feature.service'

const prisma = new PrismaClient()

/**
 * Cron job to deactivate expired features
 */
export default defineCronHandler('daily', async () => {
  try {
    const now = new Date()
    
    // 1. Deactivate expired features
    const expiredResult = await prisma.userFeature.updateMany({
      where: {
        isActive: true,
        expiresAt: { not: null, lte: now }
      },
      data: { 
        isActive: false,
        updatedAt: now
      }
    })

    // 2. Deactivate features that have their base feature disabled
    const inactiveFeaturesResult = await prisma.userFeature.updateMany({
      where: {
        isActive: true,
        feature: {
          isActive: false
        }
      },
      data: {
        isActive: false,
        updatedAt: now
      }
    })

    const totalDeactivated = expiredResult.count + inactiveFeaturesResult.count
    
    if (totalDeactivated > 0) {
      console.log(`[${now.toISOString()}] Deactivated ${totalDeactivated} features:`)
      if (expiredResult.count > 0) {
        console.log(`  - ${expiredResult.count} expired features`)
      }
      if (inactiveFeaturesResult.count > 0) {
        console.log(`  - ${inactiveFeaturesResult.count} features with inactive base feature`)
      }
    } else {
      console.log(`[${now.toISOString()}] No features to deactivate`)
    }
  } catch (error) {
    console.error('Error in check-features cron job:', error)
    // Here you can add error notification sending
  }
})

// Re-export service methods for backward compatibility
export { FeatureService } from '~/server/services/feature.service'
