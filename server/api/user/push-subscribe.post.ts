import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.string()
})

export default defineEventHandler(async (event) => {
  const user = event.context?.auth?.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const body = await readBody(event)
  const { endpoint, keys } = schema.parse(body)

  // Сохраняем подписку
  const existing = await prisma.pushSubscription.findFirst({ where: { userId: user.id, endpoint } })
  if (existing) {
    await prisma.pushSubscription.update({ where: { id: existing.id }, data: { keys } })
  } else {
    await prisma.pushSubscription.create({ data: { userId: user.id, endpoint, keys } })
  }

  return { success: true }
})