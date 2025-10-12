import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'
import { getUser } from '~/server/utils/session'
import { ModerationService } from '~/server/services/moderation.service'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const user = await getUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    if (!user || !['admin', 'moderator'].includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access forbidden'
      })
    }

    const id = Number(event.context.params?.id)
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Item ID is required'
      })
    }

    const wifiPoint = await prisma.wifiPoint.findUnique({
      where: { id },
      include: {
        reviews: true,
        securityReports: true
      }
    })

    if (!wifiPoint) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item not found'
      })
    }

    const moderation = new ModerationService(useRuntimeConfig())

    const descriptionToxicity = wifiPoint.description 
      ? await moderation.checkToxicity(wifiPoint.description)
      : null

    const reviewToxicity = await Promise.all(
      wifiPoint.reviews.map(async (review) => {
        if (!review.comment) return null
        const result = await moderation.checkToxicity(review.comment)
        return {
          reviewId: review.id,
          toxicity: result
        }
      })
    )

    const securityToxicity = await Promise.all(
      (wifiPoint as any).securityReports.map(async (report: any) => {
        if (!report.risks) return null
        const risks = await moderation.checkToxicity(report.risks)
        const comment = report.comment
          ? await moderation.checkToxicity(report.comment)
          : null
        return {
          reportId: report.id,
          risksToxicity: risks,
          commentToxicity: comment
        }
      })
    )

    return {
      success: true,
      data: {
        description: descriptionToxicity,
        reviews: reviewToxicity.filter(Boolean),
        security: securityToxicity
      }
    }
  } catch (error) {
    console.error('[Admin Moderation API] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch toxicity stats'
    })
  }
})