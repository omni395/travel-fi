import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'
import { z } from 'zod'

const schema = z.object({ endpoint: z.string().url() })

export default defineEventHandler(async (event) => {
  const user = event.context?.auth?.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const body = await readBody(event)
  const { endpoint } = schema.parse(body)

  await prisma.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } })

  return { success: true }
})