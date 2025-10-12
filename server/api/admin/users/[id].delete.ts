import { createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const admin = event.context?.auth?.user;
  if (!admin || (admin.role !== "admin" && admin.role !== "moderator")) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  let userId: number | undefined;
  if (event.context?.params?.id) {
    userId = parseInt(event.context.params.id);
  } else {
    // fallback: парсим из URL
    const match = event.node.req.url?.match(/\/admin\/users\/(\d+)/);
    if (match && match[1]) userId = parseInt(match[1]);
  }
  if (!userId || isNaN(userId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user id" });
  }

  // Проверка: нельзя удалить самого себя
  if (admin.id === userId) {
    throw createError({ statusCode: 400, statusMessage: "Нельзя удалить свой собственный аккаунт через админку" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId } }),
      prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: "DELETE_USER",
          targetType: "User",
          targetId: userId,
          result: "success",
          ipAddress: event.node.req.headers["x-forwarded-for"]?.toString() || event.node.req.socket.remoteAddress,
          userAgent: event.node.req.headers["user-agent"],
          metadata: { deletedUserEmail: user.email, deletedUserWallet: user.walletAddress },
        },
      }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "DELETE_USER",
        targetType: "User",
        targetId: userId,
        result: "failure",
        ipAddress: event.node.req.headers["x-forwarded-for"]?.toString() || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
        metadata: { error: String(error) },
      },
    });
    throw createError({ statusCode: 500, statusMessage: "Failed to delete user", data: { error: String(error) } });
  }
});
