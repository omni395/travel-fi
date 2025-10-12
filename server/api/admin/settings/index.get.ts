import { getUser } from '~/server/utils/session'
import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  

  
  if (!user?.isAdmin) throw createError({ statusCode: 403, message: 'Forbidden' })

  const settings = await prisma.adminSetting.findMany()
  const settingsObject = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, number>)

  return {
    data: settingsObject,
    success: true
  }
})