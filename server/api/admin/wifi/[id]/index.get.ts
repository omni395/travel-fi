import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  // Проверка прав доступа
  const user = event.context.auth?.user
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  const id = parseInt(getRouterParam(event, 'id') || '', 10)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID',
    })
  }

  const point = await prisma.wifiPoint.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      },
      securityReports: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  })

  if (!point) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Point not found',
    })
  }

  // Вычисляем средний рейтинг
  const avgRating = point.reviews.length > 0
    ? point.reviews.reduce((sum, review) => sum + review.rating, 0) / point.reviews.length
    : 0

  return {
    success: true,
    data: {
      ...point,
      averageRating: avgRating,
    },
  }
})