import { z } from 'zod';
import prisma from '~/lib/prisma';

// Схема валидации для отзыва
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(30).max(500),
  _csrf: z.string(),
});

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params?.id);
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid WiFi point ID',
      });
    }

    // Проверяем существование точки
    const wifiPoint = await prisma.wifiPoint.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!wifiPoint) {
      throw createError({
        statusCode: 404,
        message: 'WiFi point not found',
      });
    }

    if (wifiPoint.status !== 'approved') {
      throw createError({
        statusCode: 403,
        message: 'Cannot review unapproved WiFi point',
      });
    }

    const body = await readBody(event);
    const validated = reviewSchema.parse(body);

    const userId = event.context.auth.user.id;

    // Проверяем, не оставлял ли уже пользователь отзыв
    const existingReview = await prisma.review.findFirst({
      where: {
        targetId: id,
        targetType: 'wifi',
        userId: userId,
      },
    });

    if (existingReview) {
      throw createError({
        statusCode: 400,
        message: 'You have already reviewed this WiFi point',
      });
    }

    // Создаем отзыв в транзакции
    const review = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          rating: validated.rating,
          comment: validated.comment,
          userId: userId,
          targetId: id,
          targetType: 'wifi',
          wifiPointId: id,
        },
      });

      // Добавляем очки пользователю
      await tx.contribution.create({
        data: {
          userId: userId,
          type: 'add_review',
          points: 1,
          targetId: id,
          targetType: 'WIFI_POINT',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: 1 } },
      });

      return review;
    });

    return {
      success: true,
      data: review,
    };
  } catch (error: any) {
    console.error('Error adding review:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error',
    });
  }
});