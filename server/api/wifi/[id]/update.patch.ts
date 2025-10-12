// server/api/wifi/[id]/update.patch.ts
import { defineEventHandler, readBody, getRouterParam, createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

// Валидация входных данных
const wifiPointUpdateSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  ssid: z.string().min(1).max(100).optional(),
  password: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).min(1).max(10).optional(),
  connectionType: z.enum(["Free", "Paid", "Password-Protected"]).optional(),
  speed: z.enum(["Slow", "Medium", "Fast"]).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export default defineEventHandler(async (event) => {
  try {
    // Проверка аутентификации
    const auth = event.context.auth;
    if (!auth || !auth.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    const userId = auth.user.id;

    // Получаем ID точки
    const wifiPointId = getRouterParam(event, "id");
    if (!wifiPointId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Wi-Fi point ID is required",
      });
    }

    const pointId = parseInt(wifiPointId, 10);
    if (isNaN(pointId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Wi-Fi point ID",
      });
    }

    // Проверяем существование точки
    const existingPoint = await prisma.wifiPoint.findUnique({
      where: { id: pointId },
    });

    if (!existingPoint) {
      throw createError({
        statusCode: 404,
        statusMessage: "Wi-Fi point not found",
      });
    }

    // Проверяем, что пользователь является владельцем точки
    if (existingPoint.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "You can only edit your own Wi-Fi points",
      });
    }

    // Получаем и валидируем данные
    const body = await readBody(event);

    let validatedData;
    try {
      validatedData = wifiPointUpdateSchema.parse(body);
    } catch (validationError: any) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid input data",
        data: validationError.errors,
      });
    }

    // Обновляем точку
    const updatedPoint = await prisma.wifiPoint.update({
      where: { id: pointId },
      data: validatedData,
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true, badges: true },
        },
      },
    });

    // Создаем audit log
    try {
      const ipAddress = (event.node?.req?.headers?.["x-forwarded-for"] || event.node?.req?.socket?.remoteAddress) as string | undefined;
      const userAgent = event.node?.req?.headers?.["user-agent"] as string | undefined;
      await prisma.auditLog.create({
        data: {
          userId,
          action: "wifi.update",
          targetType: "WifiPoint",
          targetId: updatedPoint.id,
          result: "success",
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          metadata: {
            changes: validatedData,
          },
        },
      });
    } catch (auditErr) {
      console.warn("[WiFi Update API] Audit log create failed:", auditErr);
    }

    return {
      success: true,
      data: {
        point: updatedPoint,
        message: "Wi-Fi point updated successfully",
      },
    };
  } catch (error: any) {
    console.error("[WiFi Update API] Error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update Wi-Fi point",
    });
  }
});
