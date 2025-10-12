import { getUser } from '~/server/utils/session'
import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '~/lib/prisma'
import { z } from 'zod'

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
  weeklyPointsLimit: z.number().min(0)
})

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  

  
  if (!user?.isAdmin) throw createError({ statusCode: 403, message: 'Forbidden' })

  const body = await readBody(event)
  
  try {
    const settings = settingsSchema.parse(body)
    
    // Update all settings in a transaction
    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        await tx.adminSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      }
    })

    return { success: true }
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw createError({ 
        statusCode: 400, 
        message: 'Invalid settings data: ' + err.errors.map(e => e.message).join(', ')
      })
    }
    throw err
  }
})