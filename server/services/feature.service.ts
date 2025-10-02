import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type FeatureAccessResult = {
  hasAccess: boolean;
  reason?: 'FEATURE_NOT_FOUND' | 'FEATURE_INACTIVE' | 'FEATURE_EXPIRED' | 'ACCESS_DENIED' | 'SERVER_ERROR';
  message?: string;
  expiredAt?: Date;
  feature?: {
    key: string;
    name: string;
    isPremium: boolean;
    expiresAt?: Date | null;
  };
}

export class FeatureService {
  /**
   * Checks if a user has access to a feature
   */
  static async checkAccess(userId: number, featureKey: string): Promise<FeatureAccessResult> {
    try {
      const now = new Date()
      
      // Find an active feature for the user
      const userFeature = await prisma.userFeature.findFirst({
        where: {
          userId,
          isActive: true,
          feature: {
            key: featureKey,
            isActive: true
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        },
        include: {
          feature: true
        }
      })

      // If feature not found or inactive
      if (!userFeature) {
        // Check if the feature exists at all
        const featureExists = await prisma.feature.findUnique({
          where: { key: featureKey }
        })

        if (!featureExists) {
          return {
            hasAccess: false,
            reason: 'FEATURE_NOT_FOUND',
            message: 'Feature not found'
          }
        }

        // Check if the feature is inactive
        if (!featureExists.isActive) {
          return {
            hasAccess: false,
            reason: 'FEATURE_INACTIVE',
            message: 'Feature is not active'
          }
        }

        return {
          hasAccess: false,
          reason: 'ACCESS_DENIED',
          message: 'User does not have access to this feature'
        }
      }

      // If the feature has expired but is still marked as active
      if (userFeature.expiresAt && userFeature.expiresAt <= now) {
        // Automatically deactivate
        await prisma.userFeature.update({
          where: { id: userFeature.id },
          data: { isActive: false, updatedAt: now }
        })

        return {
          hasAccess: false,
          reason: 'FEATURE_EXPIRED',
          message: 'Feature access has expired',
          expiredAt: userFeature.expiresAt
        }
      }

      return {
        hasAccess: true,
        feature: {
          key: userFeature.feature.key,
          name: userFeature.feature.name,
          isPremium: userFeature.feature.isPremium,
          expiresAt: userFeature.expiresAt
        }
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      return {
        hasAccess: false,
        reason: 'SERVER_ERROR',
        message: 'Error checking feature access'
      }
    }
  }

  /**
   * Checks if a user has access to a feature (simplified version)
   */
  static async hasAccess(userId: number, featureKey: string): Promise<boolean> {
    const result = await this.checkAccess(userId, featureKey)
    return result.hasAccess
  }

  /**
   * Adds or updates a feature for a user
   */
  static async assignFeature(
    userId: number, 
    featureKey: string, 
    options: { expiresAt?: Date; metadata?: any } = {}
  ) {
    const feature = await prisma.feature.findUnique({
      where: { key: featureKey }
    })

    if (!feature) {
      throw new Error(`Feature ${featureKey} not found`)
    }

    const data = {
      isActive: true,
      expiresAt: options.expiresAt,
      metadata: options.metadata,
      updatedAt: new Date()
    }

    return prisma.userFeature.upsert({
      where: {
        userId_featureId: {
          userId,
          featureId: feature.id
        }
      },
      update: data,
      create: {
        ...data,
        userId,
        featureId: feature.id
      }
    })
  }

  /**
   * Revokes a user's access to a feature
   */
  static async revokeFeature(userId: number, featureKey: string) {
    const feature = await prisma.feature.findUnique({
      where: { key: featureKey }
    })

    if (!feature) {
      throw new Error(`Feature ${featureKey} not found`)
    }

    return prisma.userFeature.updateMany({
      where: {
        userId,
        featureId: feature.id,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Gets all active features for a user
   */
  static async getUserFeatures(userId: number) {
    return prisma.userFeature.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        feature: true
      }
    })
  }
}
