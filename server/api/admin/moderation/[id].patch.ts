import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/lib/prisma'
import { getUser } from '~/server/utils/session'
import { ModerationService } from '~/server/services/moderation.service'

// PATCH /api/admin/moderation/:id
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
      })
    }

    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Item ID is required',
      });
    }

    const body = await readBody(event);
    const { status, reason } = body;

    if (!['approved', 'rejected'].includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid status',
      });
    }

    if (status === 'rejected' && !reason) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rejection reason is required',
      });
    }

    // Обновляем статус Wi-Fi точки
    const wifiPoint = await prisma.wifiPoint.update({
      where: { id },
      data: {
        status,
        ...(reason && { moderationReason: reason }),
        moderatedAt: new Date(),
        moderatorId: user.id,
      },
    });

    // Если точка одобрена, начисляем баллы пользователю
    if (status === 'approved') {
      await prisma.$transaction([
        prisma.contribution.create({
          data: {
            userId: wifiPoint.userId,
            type: 'add_wifi',
            points: 2, // Баллы за Wi-Fi точку
            wifiPointId: wifiPoint.id,
          },
        }),
        prisma.user.update({
          where: { id: wifiPoint.userId },
          data: {
            points: { increment: 2 },
          },
        }),
      ]);
    }

    // Записываем действие в аудит
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: status === 'approved' ? 'approve_wifi' : 'reject_wifi',
        targetType: 'wifi_point',
        targetId: id,
        metadata: {
          status,
          reason,
        },
      },
    });

    return {
      success: true,
      data: wifiPoint,
    };
  } catch (error: any) {
    console.error('[Admin Moderation API] Error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update moderation status',
    });
  }
});