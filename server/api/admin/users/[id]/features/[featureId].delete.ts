// server/api/admin/users/[id]/features/[featureId].delete.ts
import { createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const authUser = event.context?.auth?.user;

  // Только админы могут отзывать фичи
  if (!authUser || authUser.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const userId = parseInt(event.context.params?.id || "0");
  const featureId = parseInt(event.context.params?.featureId || "0");

  if (!userId || isNaN(userId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }

  if (!featureId || isNaN(featureId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid feature ID" });
  }

  try {
    // Проверяем, существует ли UserFeature
    const userFeature = await prisma.userFeature.findUnique({
      where: { id: featureId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!userFeature) {
      throw createError({
        statusCode: 404,
        statusMessage: "User feature not found",
      });
    }

    if (userFeature.userId !== userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Feature does not belong to this user",
      });
    }

    // Удаляем фичу
    await prisma.userFeature.delete({
      where: { id: featureId },
    });

    // Логируем действие в audit log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "REVOKE_USER_FEATURE",
        targetType: "UserFeature",
        targetId: featureId,
        result: "success",
        metadata: {
          targetUserId: userId,
          targetUserEmail: userFeature.user.email,
          featureName: userFeature.feature,
        },
        ipAddress:
          event.node.req.headers["x-forwarded-for"]?.toString() ||
          event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    });

    return {
      success: true,
      message: "Feature revoked successfully",
    };
  } catch (error) {
    console.error("Revoke feature error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to revoke feature",
      data: { error: String(error) },
    });
  }
});
