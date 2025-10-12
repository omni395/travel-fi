import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const { type, id } = event.context.params
  const targetId = parseInt(id)

  if (!targetId || !type) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    })
  }

  const vote = await prisma.vote.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType: type,
        targetId
      }
    }
  })

  return vote
})