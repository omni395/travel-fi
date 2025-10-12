// server/api/admin/users/[id]/role.patch.ts
import { createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

const roleSchema = z.object({
  role: z.enum(["user", "moderator", "admin"]),
});

export default defineEventHandler(async (event) => {
  const authUser = event.context?.auth?.user;

  // Только админы могут менять роли
  if (!authUser || authUser.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const id = parseInt(event.context.params?.id || "0");

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }

  const body = await readBody(event);
  const validation = roleSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid role",
      data: validation.error.issues,
    });
  }

  const { role } = validation.data;

  try {
    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Обновляем роль
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Логируем действие в audit log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "UPDATE_USER_ROLE",
        targetType: "User",
        targetId: id,
        result: "success",
        metadata: {
          oldRole: user.role,
          newRole: role,
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
    console.error("Update role error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update role",
      data: { error: String(error) },
    });
  }
});
