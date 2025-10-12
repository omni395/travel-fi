// server/api/admin/users/[id]/sessions/[sessionId].delete.ts
import { createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const authUser = event.context?.auth?.user;

  // Только админы и модераторы могут завершать сессии
  if (!authUser || !["admin", "moderator"].includes(authUser.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const userId = parseInt(event.context.params?.id || "0");
  const sessionId = event.context.params?.sessionId || "";

  if (!userId || isNaN(userId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: "Invalid session ID" });
  }

  try {
    // Проверяем, существует ли активная сессия и принадлежит ли она указанному пользователю
    const session = await prisma.session.findFirst({
      where: { 
        id: sessionId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        expiresAt: true,
        userAgent: true,
        isActive: true,
      },
    });

    if (!session) {
      throw createError({
        statusCode: 404,
        statusMessage: "Session not found",
      });
    }

    if (session.userId !== userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Session does not belong to this user",
      });
    }

    // Получаем информацию о пользователе для проверки прав
    const targetUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, email: true },
    });

    // Модераторы не могут завершать сессии админов/модераторов
    if (
      authUser.role === "moderator" &&
      targetUser &&
      ["admin", "moderator"].includes(targetUser.role)
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "Cannot terminate admin or moderator sessions",
      });
    }

    // Деактивируем сессию
    await prisma.session.update({
      where: { id: sessionId },
      data: { 
        isActive: false,
        expiresAt: new Date() // Немедленное истечение срока
      },
    });

    // Логируем действие в audit log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "TERMINATE_USER_SESSION",
        targetType: "Session",
        targetId: userId,
        result: "success",
        metadata: {
          targetUserId: userId,
          targetUserEmail: targetUser?.email || "unknown",
          sessionId: sessionId,
        },
        ipAddress:
          event.node.req.headers["x-forwarded-for"]?.toString() ||
          event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    });

    return {
      success: true,
      message: "Session terminated successfully",
    };
  } catch (error) {
    console.error("Terminate session error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to terminate session",
      data: { error: String(error) },
    });
  }
});
