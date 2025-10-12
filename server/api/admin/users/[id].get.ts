// server/api/admin/users/[id].get.ts
import { createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  console.log("Admin user detail API: request path:", event.path);

  const id = parseInt(event.context.params?.id || "0");
  console.log("Admin user detail API: looking up user id:", id);

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        sessions: {
          where: {
            isActive: true,
            expiresAt: { gt: new Date() }
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
            userAgent: true,
            isActive: true,
            ipAddress: true,
          },
        },
        contributions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            type: true,
            points: true,
            createdAt: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            targetType: true,
            targetId: true,
          },
        },
        features: {
          select: {
            id: true,
            feature: true,
            createdAt: true,
          },
        },
        wifiPoints: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            ssid: true,
            createdAt: true,
          },
        },
        securityReports: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            createdAt: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            action: true,
            targetType: true,
            targetId: true,
            createdAt: true,
          },
        },
        pushSubscriptions: {
          select: {
            id: true,
            endpoint: true,
            createdAt: true,
          },
        },
        referredBy: {
          take: 10,
          select: {
            id: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        referredTo: {
          take: 10,
          select: {
            id: true,
            createdAt: true,
            suggestedUser: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
      },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Подсчитываем статистику
    const [totalContributions, totalReviews, totalWifiPoints, totalSessions, activeSessions] =
      await Promise.all([
        prisma.contribution.count({ where: { userId: id } }),
        prisma.review.count({ where: { userId: id } }),
        prisma.wifiPoint.count({ where: { userId: id } }),
        prisma.session.count({ where: { userId: id } }),
        prisma.session.count({ 
          where: { 
            userId: id,
            isActive: true,
            expiresAt: { gt: new Date() }
          } 
        }),
      ]);

    console.log("Admin user detail API: found user:", {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      confirmedEmail: user.confirmedEmail
    });
    console.log("Admin user detail API: user stats:", {
      totalContributions,
      totalReviews,
      totalWifiPoints,
      totalSessions,
      activeSessions
    });

    return {
      user,
      stats: {
        totalContributions,
        totalReviews,
        totalWifiPoints,
        totalSessions,
        activeSessions,
      },
    };
  } catch (error) {
    console.error("Admin user detail API: Database error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
      data: { error: String(error) },
    });
  }
});
