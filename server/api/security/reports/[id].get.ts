import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}
  if (!id) throw createError({ statusCode: 400, message: 'Missing Wi-Fi point ID' })

  const reports = await prisma.securityReport.findMany({
    where: {
      wifiPointId: parseInt(id),
      status: 'approved'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return { success: true, data: reports }
})