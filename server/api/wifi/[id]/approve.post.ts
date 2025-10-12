import { createError, readBody } from "h3";
import prisma from "~/lib/prisma";
import { ethers } from "ethers";

export default defineEventHandler(async (event) => {
  const admin = event.context?.auth?.user;
  if (!admin || (admin.role !== "admin" && admin.role !== "moderator")) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  let id: number | undefined;
  if (event.context?.params?.id) {
    id = Number(event.context.params.id);
  } else {
    const match = event.node.req.url?.match(/\/wifi\/(\d+)\/approve/);
    if (match && match[1]) id = Number(match[1]);
  }
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid Wi-Fi point id" });
  }

  const body = await readBody(event);
  const status = body?.status || "approved";
  if (status !== "approved") {
    throw createError({ statusCode: 400, statusMessage: "Only approval supported" });
  }

  // Получаем точку и пользователя
  const wifiPoint = await prisma.wifiPoint.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!wifiPoint) {
    throw createError({ statusCode: 404, statusMessage: "Wi-Fi point not found" });
  }
  if (wifiPoint.status === "approved") {
    return { success: true, message: "Already approved" };
  }

  // Одобряем точку
  await prisma.wifiPoint.update({
    where: { id },
    data: { status: "approved" },
  });

  // Награждение пользователя
  const user = wifiPoint.user;
  let rewardType = "points";
  let txHash = null;
  if (user.walletAddress) {
    // Смарт-контракт Polygon
    try {
      const config = useRuntimeConfig();
      const provider = new ethers.JsonRpcProvider(config.polygonRpcUrl);
      const contract = new ethers.Contract(
        config.tokenContractAddress,
        config.tokenContractAbi,
        new ethers.Wallet(config.tokenPrivateKey, provider)
      );
      txHash = await contract.transfer(user.walletAddress, ethers.parseUnits("5", 18));
      rewardType = "token";
    } catch (err) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "wifi.token_reward",
          targetType: "WifiPoint",
          targetId: wifiPoint.id,
          result: "failure",
          metadata: { error: String(err), walletAddress: user.walletAddress },
        },
      });
    }
  }
  if (rewardType === "points") {
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: 5 } },
    });
    // Пересчёт бейджей
    try {
      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      const newBadges = calculateBadges((updated?.points || 0));
      if (updated && newBadges.length > (updated.badges || []).length) {
        await prisma.user.update({ where: { id: user.id }, data: { badges: newBadges } });
      }
    } catch (badgeErr) {
      console.error('Badge update error:', badgeErr);
    }
  }
  await prisma.contribution.create({
    data: {
      userId: user.id,
      type: "add_wifi",
      points: rewardType === "points" ? 5 : 0,
      reportId: null,
    },
  });
  // Обновляем статистику и возвращаем данные пользователя
  const refreshedUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log('WiFi approve: завершено для пользователя', user.id, 'rewardType=', rewardType);
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: rewardType === "token" ? "wifi.token_reward" : "wifi.point_reward",
      targetType: "WifiPoint",
      targetId: wifiPoint.id,
      result: "success",
      metadata: rewardType === "token" ? { txHash, walletAddress: user.walletAddress } : {},
    },
  });

  return { success: true, reward: rewardType, txHash, user: refreshedUser };
});

// helper for badges (duplicate from wifi/index.post.ts)
function calculateBadges(points: number): string[] {
  const badges: string[] = [];

  if (points >= 5) badges.push("Beginner");
  if (points >= 50) badges.push("Bronze");
  if (points >= 150) badges.push("Silver");
  if (points >= 500) badges.push("Gold");
  if (points >= 1500) badges.push("Platinum");
  if (points >= 5000) badges.push("Legend");

  return badges;
}
