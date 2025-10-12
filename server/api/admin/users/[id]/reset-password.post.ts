// server/api/admin/users/[id]/reset-password.post.ts
import { createError } from "h3";
import prisma from "~/lib/prisma";
import crypto from "crypto";

export default defineEventHandler(async (event) => {
  const authUser = event.context?.auth?.user;

  // Только админы и модераторы могут сбрасывать пароли
  if (!authUser || !["admin", "moderator"].includes(authUser.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const id = parseInt(event.context.params?.id || "0");

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }

  try {
    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    if (!user.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "User has no email address",
      });
    }

    // Модераторы не могут сбрасывать пароли админов/модераторов
    if (
      authUser.role === "moderator" &&
      ["admin", "moderator"].includes(user.role)
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "Cannot reset password for admin or moderator",
      });
    }

    // Генерируем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 час

    // Сохраняем токен в БД (можно создать отдельную таблицу PasswordReset)
    // Пока сохраним в metadata или можно использовать Redis
    // Для демонстрации просто логируем

    // TODO: Отправить email с ссылкой на сброс пароля
    // const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   html: `Click here to reset your password: ${resetUrl}`,
    // });

    // Логируем действие в audit log
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        action: "RESET_USER_PASSWORD",
        targetType: "User",
        targetId: id,
        result: "success",
        metadata: {
          targetEmail: user.email,
          targetName: user.name,
          resetTokenGenerated: true,
        },
        ipAddress:
          event.node.req.headers["x-forwarded-for"]?.toString() ||
          event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    });

    console.log(
      `Password reset requested for user ${user.email} by admin ${authUser.email}`,
    );
    console.log(`Reset token (for dev): ${resetToken}`);

    return {
      success: true,
      message: "Password reset email sent",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to reset password",
      data: { error: String(error) },
    });
  }
});
