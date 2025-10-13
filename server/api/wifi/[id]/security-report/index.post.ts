import { z } from 'zod';
import prisma from '~/lib/prisma';

// Схема валидации для отчета о безопасности
const securityReportSchema = z.object({
  rating: z.number().min(1).max(5),
  risks: z.string().min(30).max(1000),
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
        message: 'Cannot report unapproved WiFi point',
      });
    }

    const body = await readBody(event);
    const validated = securityReportSchema.parse(body);

    const userId = event.context.auth.user.id;

    // Проверяем, не отправлял ли уже пользователь отчет
    const existingReport = await prisma.securityReport.findFirst({
      where: {
        wifiPointId: id,
        userId: userId,
      },
    });

    if (existingReport) {
      throw createError({
        statusCode: 400,
        message: 'You have already submitted a security report for this WiFi point',
      });
    }

    // Создаем отчет в транзакции
    const report = await prisma.$transaction(async (tx) => {
      const report = await tx.securityReport.create({
        data: {
          rating: validated.rating,
          risks: validated.risks,
          status: 'pending',
          userId: userId,
          wifiPointId: id,
        },
      });

      // Добавляем очки пользователю за отчет
      await tx.contribution.create({
        data: {
          userId: userId,
          type: 'add_security_report',
          points: 2,
          targetId: id,
          targetType: 'WIFI_POINT',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: 2 } },
      });

      return report;
    });

    return {
      success: true,
      data: report,
    };
  } catch (error: any) {
    console.error('Error adding security report:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error',
    });
  }
});