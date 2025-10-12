// server/api/wifi/[id].get.ts
import { defineEventHandler, getRouterParam, createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Wi-Fi point ID is required",
      });
    }

    const pointId = parseInt(id, 10);

    if (isNaN(pointId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Wi-Fi point ID",
      });
    }

    // Получаем точку с полной информацией
    const point = await prisma.wifiPoint.findUnique({
      where: { 
        id: pointId,
        OR: [
          { status: 'approved' },
          { userId: user?.id },
          ...(isAdmin ? [{}] : [])
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            badges: true,
            points: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                badges: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        securityReports: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!point) {
      throw createError({
        statusCode: 404,
        statusMessage: "Wi-Fi point not found",
      });
    }

    // Подсчитываем статистику
    const avgRating =
      point.reviews.length > 0
        ? point.reviews.reduce((sum, r) => sum + r.rating, 0) /
          point.reviews.length
        : 0;

    const ratingDistribution = {
      5: point.reviews.filter((r) => r.rating === 5).length,
      4: point.reviews.filter((r) => r.rating === 4).length,
      3: point.reviews.filter((r) => r.rating === 3).length,
      2: point.reviews.filter((r) => r.rating === 2).length,
      1: point.reviews.filter((r) => r.rating === 1).length,
    };

    // Calculate average security rating from reports (1-5 scale)
    // and convert to percentage where:
    // 1 star = 0% (very insecure)
    // 2 stars = 25% (insecure)
    // 3 stars = 50% (neutral)
    // 4 stars = 75% (secure)
    // 5 stars = 100% (very secure)
    // Если нет отчетов о безопасности, считаем точку безопасной (100%)
    const avgSecurityRating = point.securityReports.length > 0
      ? point.securityReports.reduce((sum, r) => sum + (r.rating || 5), 0) / point.securityReports.length
      : 5; // 5 звезд по умолчанию
      
    // Convert to percentage (1=0%, 2=25%, 3=50%, 4=75%, 5=100%)
    const securityScore = point.securityReports.length === 0 ? 100 : Math.round((avgSecurityRating - 1) / 4 * 100);

    return {
      success: true,
      data: {
        ...point,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: point.reviews.length,
        securityReportCount: point.securityReports.length,
        securityScore,
        ratingDistribution,
      },
    };
  } catch (error: any) {
    console.error("[WiFi API] Error fetching point details:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch Wi-Fi point details",
    });
  }
});
