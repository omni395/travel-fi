import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'
import webpush from 'web-push'
import { z } from 'zod'

const config = useRuntimeConfig()

const schema = z.object({
  title: z.string(),
  body: z.string().optional(),
  userId: z.number().optional()
})

webpush.setVapidDetails(
  'mailto:admin@travel-fi.com',
  config.vapidPublicKey,
  config.vapidPrivateKey
)

export default defineEventHandler(async (event) => {
  const { title, body, userId } = schema.parse(await readBody(event))
  let subs
  if (userId) {
    subs = await prisma.pushSubscription.findMany({ where: { userId } })
  } else {
    subs = await prisma.pushSubscription.findMany()
  }
  if (!subs.length) throw createError({ statusCode: 404, statusMessage: 'No subscriptions found' })

  const payload = JSON.stringify({ title, body })
  const results = []
  for (const sub of subs) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: JSON.parse(sub.keys) }, payload)
      results.push({ endpoint: sub.endpoint, success: true })
    } catch (err) {
      results.push({ endpoint: sub.endpoint, success: false, error: String(err) })
    }
  }
  return { sent: results }
})