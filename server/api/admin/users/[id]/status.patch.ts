// server/api/admin/users/[id]/status.patch.ts
import { createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

const statusSchema = z.object({
  status: z.enum(["active", "suspended", "banned"]),
  reason: z.string().min(1, "Reason is required"),
});

export default defineEventHandler(async (event) => {
  const authUser = event.context?.auth?.user;

  // Админы и модераторы могут менять статусы
  if (!authUser || !["admin", "moderator"].includes(authUser.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const id = parseInt(event.context.params?.id || "0");

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }

  const body = await readBody(event);
  const validation = statusSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid status",
      data: validation.error.issues,
    });
  }

  const { status, reason } = validation.data;

  try {
    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, status: true, role: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Модераторы не могут банить или изменять статус админов/модераторов
    if (authUser.role === "moderator") {
      if (["admin", "moderator"].includes(user.role)) {
        throw createError({
          statusCode: 403,
          statusMessage: "Cannot modify admin or moderator status",
        });
      }
      if (status === "banned") {
        throw createError({
          statusCode: 403,
          statusMessage: "Moderators cannot ban users",
        });
      }
    }

    // Нельзя изменить свой собственный статус
    if (user.id === authUser.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot change your own status",
      });
    }

    // Обновляем статус
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Если пользователь забанен или приостановлен - удаляем все его сессии
    if (["banned", "suspended"].includes(status)) {
      await prisma.session.deleteMany({
        where: {
          userId: id,
        },
      });
    }

    // Логируем действие в audit log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "UPDATE_USER_STATUS",
        targetType: "User",
        targetId: id,
        result: "success",
        reason: reason,
        metadata: {
          oldStatus: user.status,
          newStatus: status,
          targetEmail: user.email,
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
  } catch (error) {
    console.error("Update status error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update status",
      data: { error: String(error) },
    });
  }
});
