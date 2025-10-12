// server/api/user/profile/wallet.post.ts
import { createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";
import { rewardForConnect } from '~/services/token.service'

const walletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});

export default defineEventHandler(async (event) => {
  // Диагностика: логируем auth payload
  console.log('CONNECT WALLET: auth payload=', JSON.stringify(event.context?.auth?.user));
  let authUser = event.context?.auth?.user;
  let user: any = null;

  // Если в payload только userId, подгружаем полную запись из БД
  if (authUser) {
    if (authUser.id) {
      user = authUser; // уже полная
    } else if ((authUser as any).userId) {
      user = await prisma.user.findUnique({ where: { id: Number((authUser as any).userId) } });
    }
  }

  if (!user) {
    console.error('CONNECT WALLET: no authenticated user found in context', event.context?.auth?.user);
    throw createError({ statusCode: 403, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const validation = walletSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid wallet address",
      data: validation.error.issues,
    });
  }

  const { walletAddress } = validation.data;

  try {
    // Проверяем, не привязан ли кошелёк к другому пользователю
    const existingUser = await prisma.user.findFirst({
      where: {
        walletAddress,
        id: { not: user.id },
      },
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: "Пользователь с таким кошельком уже существует",
      });
    }

  // Привязываем кошелёк к текущему пользователю
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress },
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

    // Попытка начисления токенов за привязку кошелька (если настроено)
    try {
      const config = useRuntimeConfig() as any
      if (config.rewardOnConnect && Number(config.rewardOnConnect) > 0) {
        const txHash = await rewardForConnect(user.id, walletAddress)
        console.log('Wallet connect: token reward txHash=', txHash)
      }
    } catch (err) {
      console.error('Wallet connect: token reward failed', err)
    }
    // Логируем действие
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CONNECT_WALLET",
        targetType: "User",
        targetId: user.id,
        result: "success",
        metadata: {
          walletAddress,
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

    console.error("Wallet connect error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to connect wallet",
      data: { error: String(error) },
    });
  }
});
