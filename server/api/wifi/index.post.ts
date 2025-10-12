// server/api/wifi/index.post.ts
import { defineEventHandler, createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

// Валидация входных данных
const wifiPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  ssid: z.string().min(1).max(100),
  password: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).min(1).max(10),
  connectionType: z.enum(["Free", "Paid", "Password-Protected"]),
  speed: z.enum(["Slow", "Medium", "Fast"]).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export default defineEventHandler(async (event) => {
  try {
    // Проверка аутентификации
    const auth = event.context.auth;
    if (!auth || !auth.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }
    const userId = auth.user.id;
    // Запрещаем добавление точек для неподтверждённых пользователей
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.confirmedEmail) {
      throw createError({
        statusCode: 403,
        statusMessage: "Только подтверждённые пользователи могут добавлять точки Wi-Fi",
      });
    }

    // Получаем и валидируем данные
    const body = await readBody(event);

    let validatedData;
    try {
      validatedData = wifiPointSchema.parse(body);
    } catch (validationError: any) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid input data",
        data: validationError.errors,
      });
    }

    // AI проверка токсичности описания (если есть)
    let needsModeration = false;
    let toxicityScores: any = null;
    if (
      validatedData.description &&
      validatedData.description.trim().length > 0
    ) {
      const toxicityResult = await checkToxicity(validatedData.description);

      if (toxicityResult.isToxic) {
        throw createError({
          statusCode: 400,
          statusMessage: "Description contains inappropriate content",
        });
      }
      
      needsModeration = toxicityResult.needsModeration;
      toxicityScores = toxicityResult.scores || null;
    }

    // Проверка на дубликаты (та же точка в радиусе 50м)
    const nearbyPoints = await prisma.wifiPoint.findMany({
      where: {
        ssid: validatedData.ssid,
      },
    });

    const duplicateExists = nearbyPoints.some((point: any) => {
      const distance = calculateDistance(
        validatedData.lat,
        validatedData.lng,
        point.lat,
        point.lng,
      );
      return distance < 0.05; // 50 метров
    });

    if (duplicateExists) {
      throw createError({
        statusCode: 409,
        statusMessage: "Wi-Fi point already exists nearby",
      });
    }

  console.log('[WiFi API] Creating wifi point in DB for userId:', userId)
  // Создаем точку (статус pending), не начисляем награды до модерации
  const result = await prisma.$transaction(async (tx: any) => {
    const wifiPoint = await tx.wifiPoint.create({
      data: {
        userId,
        lat: validatedData.lat,
        lng: validatedData.lng,
        ssid: validatedData.ssid,
        password: validatedData.password,
        tags: validatedData.tags,
        connectionType: validatedData.connectionType,
        speed: validatedData.speed,
        description: validatedData.description,
        status: "pending",
        moderationNote: needsModeration ? "Requires attention: possible inappropriate content" : null,
      },
      include: {
        user: {
          select: { id: true, name: true, profilePicture: true, badges: true },
        },
      },
    });

    try {
      const ipAddress = (event.node?.req?.headers?.["x-forwarded-for"] || event.node?.req?.socket?.remoteAddress) as string | undefined;
      const userAgent = event.node?.req?.headers?.["user-agent"] as string | undefined;
      await tx.auditLog.create({
        data: {
          userId,
          action: "wifi.create",
          targetType: "WifiPoint",
          targetId: wifiPoint.id,
          result: "success",
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          metadata: { 
            ssid: wifiPoint.ssid,
            lat: wifiPoint.lat,
            lng: wifiPoint.lng,
            needsModeration,
            toxicityScores
          },
        },
      });
    } catch (auditErr) {
      console.warn("[WiFi API] Audit log create failed:", auditErr);
    }

    return wifiPoint;
  });

  console.log('[WiFi API] WiFi create result:', result && result.id);

  return {
    success: true,
    data: {
      point: result,
      message: "Wi-Fi point added successfully and pending moderation",
    },
  };
  } catch (error: any) {
    console.error("[WiFi API] Error creating point:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create Wi-Fi point",
    });
  }
});

// AI проверка токсичности через Hugging Face
async function checkToxicity(text: string): Promise<{ isToxic: boolean; needsModeration: boolean; scores?: any }> {
  try {
    const config = useRuntimeConfig();
    const apiKey = config.huggingface?.apiKey;

    if (!apiKey) {
      console.warn(
        "[WiFi API] Hugging Face API key not configured, skipping toxicity check",
      );
      return { isToxic: false, needsModeration: true };
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/unitary/multilingual-toxic-xlm-roberta",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      },
    );

    if (!response.ok) {
      console.warn("[WiFi API] Toxicity check failed:", response.statusText);
      return { isToxic: false, needsModeration: true };
    }

    const result = await response.json();

    // Проверяем различные типы токсичности
    if (Array.isArray(result) && result[0]) {
      const labels = result[0];
      const toxicLabels = {
        toxic: labels.find((l: any) => l.label === "toxic")?.score || 0,
        severe_toxic: labels.find((l: any) => l.label === "severe_toxic")?.score || 0,
        obscene: labels.find((l: any) => l.label === "obscene")?.score || 0,
        threat: labels.find((l: any) => l.label === "threat")?.score || 0,
        insult: labels.find((l: any) => l.label === "insult")?.score || 0,
        hate: labels.find((l: any) => l.label === "identity_hate")?.score || 0
      };

      // Если любой из показателей выше 0.7 - требует модерации
      const needsModeration = Object.values(toxicLabels).some(score => score > 0.7);

      return { 
        isToxic: false, // Теперь всегда пропускаем
        needsModeration,
        scores: toxicLabels
      };
    }

    return { isToxic: false, needsModeration: true };
  } catch (error) {
    console.error("[WiFi API] Toxicity check error:", error);
    return { isToxic: false, needsModeration: true }; // В случае ошибки пропускаем проверку
  }
}

// Расчет расстояния между точками (Haversine)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // км
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Расчет бейджей на основе баллов
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
