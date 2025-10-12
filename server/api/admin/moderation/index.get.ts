import { defineEventHandler, readBody, getQuery, createError } from 'h3'
import { getUser } from '~/server/utils/session'
import prisma from '~/lib/prisma'

// GET /api/admin/moderation
// Получение списка контента для модерации
export default defineEventHandler(async (event) => {
  try {
    const user = await getUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    if (!user.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access forbidden'
      });
    }

    // Получаем параметры запроса
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const type = query.type?.toString() || 'all';
    const status = query.status?.toString() || 'pending';
    const search = query.search?.toString() || '';

    const skip = (page - 1) * limit;

    // Формируем условия для поиска
    const where: any = {
      status,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { ssid: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Подсчет общего количества записей
    const total = await prisma.wifiPoint.count({ where });

    // Получение записей с пагинацией
    const items = await prisma.wifiPoint.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error('[Admin Moderation API] Error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch moderation items',
    });
  }
});