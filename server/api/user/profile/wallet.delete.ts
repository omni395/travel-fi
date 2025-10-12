// server/api/user/profile/wallet.delete.ts
import { createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = event.context?.auth?.user;

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    // Отключаем кошелёк
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress: null },
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
        action: "DISCONNECT_WALLET",
        targetType: "User",
        targetId: user.id,
        result: "success",
        metadata: {
          previousWallet: user.walletAddress,
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
    console.error("Wallet disconnect error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to disconnect wallet",
      data: { error: String(error) },
    });
  }
});
