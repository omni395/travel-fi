// server/api/user/profile/push.patch.ts
import { createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

const pushSchema = z.object({
  pushEnabled: z.boolean(),
});

export default defineEventHandler(async (event) => {
  const user = event.context?.auth?.user;

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const validation = pushSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid data",
      data: validation.error.issues,
    });
  }

  const { pushEnabled } = validation.data;

  try {
    // Обновляем настройки push
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { pushEnabled },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        points: true,
        role: true,
        status: true,
        badges: true,
        leaderboardRank: true,
        profilePicture: true,
        pushEnabled: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        confirmedEmail: true,
      },
    });

    // Логируем действие
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_PUSH_SETTINGS",
        targetType: "User",
        targetId: user.id,
        result: "success",
        metadata: {
          pushEnabled,
        },
        ipAddress:
          event.node.req.headers["x-forwarded-for"]?.toString() ||
          event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    });

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error: any) {
    console.error("Push settings update error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update push settings",
      data: { error: String(error) },
    });
  }
});
