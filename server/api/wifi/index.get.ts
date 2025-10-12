// server/api/wifi/index.get.ts
import { defineEventHandler, getQuery } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // Параметры фильтрации
    const {
      lat,
      lng,
      radius = 10, // км
      tags,
      connectionType,
      speed,
      status = "approved", // по умолчанию только одобренные
      search,
      limit = 50,
      offset = 0,
    } = query;

    const auth = event.context.auth;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

    // Базовый фильтр с учетом прав
    const where: any = {
      OR: [
        { status: status as string },
        { userId: user?.id },
        ...(isAdmin ? [{}] : [])
      ]
    };

    // Фильтр по тегам
    if (tags) {
      const tagsArray = typeof tags === "string" ? tags.split(",") : tags;
      where.tags = {
        hasSome: tagsArray,
      };
    }

    // Фильтр по типу подключения
    if (connectionType) {
      where.connectionType = connectionType as string;
    }

    // Фильтр по скорости
    if (speed) {
      where.speed = speed as string;
    }

    // Поиск по SSID или описанию
    if (search && typeof search === "string") {
      where.OR = [
        { ssid: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Получаем точки из БД
    const points = await prisma.wifiPoint.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            badges: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
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
          take: 3,
        },
        _count: {
          select: {
            reviews: true,
            securityReports: true,
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: {
        createdAt: "desc",
      },
    });

    // Если указаны координаты - фильтруем по радиусу и сортируем по расстоянию
    let filteredPoints = points;
    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const maxRadius = Number(radius);

      filteredPoints = points
        .map((point) => {
          const distance = calculateDistance(
            userLat,
            userLng,
            point.lat,
            point.lng,
          );
          return { ...point, distance };
        })
        .filter((point) => point.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance);
    }

    // Подсчет среднего рейтинга для каждой точки
    const pointsWithStats = filteredPoints.map((point) => {
      const avgRating =
        point.reviews.length > 0
          ? point.reviews.reduce((sum, r) => sum + r.rating, 0) /
            point.reviews.length
          : 0;

      return {
        ...point,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: point._count.reviews,
        securityReportCount: point._count.securityReports,
      };
    });

    // Подсчет общего количества
    const total = await prisma.wifiPoint.count({ where });

    return {
      success: true,
      data: {
        points: pointsWithStats,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    };
  } catch (error: any) {
    console.error("[WiFi API] Error fetching points:", error);
    return {
      success: false,
      error: {
        message: "Failed to fetch Wi-Fi points",
        details: error.message,
      },
    };
  }
});

// Формула Haversine для расчета расстояния между двумя точками на Земле
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // округляем до 2 знаков
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
