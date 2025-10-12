// server/api/user/profile/stats.get.ts
import { createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = event.context?.auth?.user;

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    const [
      contributions,
      reviews,
  wifiPoints,
      sessions,
      recentContributions,
      features,
    ] = await Promise.all([
      prisma.contribution.count({ where: { userId: user.id } }),
      prisma.review.count({ where: { userId: user.id } }),
  prisma.wifiPoint.count({ where: { userId: user.id, status: 'approved' } }),
      prisma.session.count({ where: { userId: user.id } }),
      prisma.contribution.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          points: true,
          createdAt: true,
        },
      }),
      prisma.userFeature.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          feature: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      contributions,
      reviews,
      wifiPoints,
      sessions,
      recentContributions,
      features,
    };
  } catch (error) {
    console.error("Profile stats error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load profile stats",
      data: { error: String(error) },
    });
  }
});
