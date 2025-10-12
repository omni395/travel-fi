import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'
import { processVote } from '~/server/services/reputation.service'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const { targetId, targetType, isUpvote } = body

  if (!targetId || !targetType) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    })
  }

  return await processVote(user.id, targetType, targetId, isUpvote)
})