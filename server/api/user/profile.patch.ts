// server/api/user/profile.patch.ts
import { createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export default defineEventHandler(async (event) => {
  const user = event.context?.auth?.user;

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const validation = profileSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid data",
      data: validation.error.issues,
    });
  }

  const { name, email } = validation.data;

  try {
    // Проверяем, не занят ли email
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw createError({
          statusCode: 400,
          statusMessage: "Пользователь с такой почтой уже существует",
        });
      }
    }

    // Обновляем профиль
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email, confirmedEmail: false }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        confirmedEmail: true,
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
      },
    });

    // Логируем действие
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_PROFILE",
        targetType: "User",
        targetId: user.id,
        result: "success",
        metadata: {
          updatedFields: Object.keys(validation.data),
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
    if (error.statusCode) throw error;

    console.error("Profile update error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update profile",
      data: { error: String(error) },
    });
  }
});
