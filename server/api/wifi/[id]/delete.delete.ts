// server/api/wifi/[id]/delete.delete.ts
import { defineEventHandler, getRouterParam, createError } from "h3";
import prisma from "~/lib/prisma";

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
    const wifiPoint = await prisma.wifiPoint.findUnique({
      where: { id: pointId },
    });

    if (!wifiPoint) {
      throw createError({
        statusCode: 404,
        statusMessage: "Wi-Fi point not found",
      });
    }

    // Проверяем, что пользователь является владельцем точки
    if (wifiPoint.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "You can only delete your own Wi-Fi points",
      });
    }

    // Удаляем точку
    await prisma.wifiPoint.delete({
      where: { id: pointId },
    });

    // Создаем audit log
    try {
      const ipAddress = (event.node?.req?.headers?.["x-forwarded-for"] || event.node?.req?.socket?.remoteAddress) as string | undefined;
      const userAgent = event.node?.req?.headers?.["user-agent"] as string | undefined;
      await prisma.auditLog.create({
        data: {
          userId,
          action: "wifi.delete",
          targetType: "WifiPoint",
          targetId: pointId,
          result: "success",
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          metadata: {
            ssid: wifiPoint.ssid,
          },
        },
      });
    } catch (auditErr) {
      console.warn("[WiFi Delete API] Audit log create failed:", auditErr);
    }

    return {
      success: true,
      message: "Wi-Fi point deleted successfully",
    };
  } catch (error: any) {
    console.error("[WiFi Delete API] Error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete Wi-Fi point",
    });
  }
});
