// server/api/wifi/[id]/review.post.ts
import { defineEventHandler, readBody, getRouterParam, createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

// Валидация данных отзыва
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500).optional(),
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

    // Получаем ID Wi-Fi точки
    const wifiPointId = getRouterParam(event, "id");
    if (!wifiPointId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Wi-Fi point ID is required",
      });
    }

    const pointId = parseInt(wifiPointId, 10);
    if (isNaN(pointId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid Wi-Fi point ID",
      });
    }

    // Проверяем существование точки
    const wifiPoint = await prisma.wifiPoint.findUnique({
      where: { id: pointId },
    });

    if (!wifiPoint) {
      throw createError({
        statusCode: 404,
        statusMessage: "Wi-Fi point not found",
      });
    }

    // Проверяем, что точка одобрена
    if (wifiPoint.status !== "approved") {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot review pending or rejected Wi-Fi point",
      });
    }

    // Получаем и валидируем данные
    const body = await readBody(event);

    let validatedData;
    try {
      validatedData = reviewSchema.parse(body);
    } catch (validationError: any) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid review data",
        data: validationError.errors,
      });
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на эту точку
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        wifiPointId: pointId,
      },
    });

    if (existingReview) {
      throw createError({
        statusCode: 409,
        statusMessage: "You have already reviewed this Wi-Fi point",
      });
    }

    // AI проверка токсичности комментария (если есть)
    if (validatedData.comment && validatedData.comment.trim().length > 0) {
      const isToxic = await checkToxicity(validatedData.comment);

      if (isToxic) {
        throw createError({
          statusCode: 400,
          statusMessage: "Comment contains inappropriate content",
        });
      }
    }

    // Создаем отзыв и начисляем баллы в транзакции
    const result = await prisma.$transaction(async (tx: any) => {
      // Создаем отзыв
      const review = await tx.review.create({
        data: {
          userId,
          targetId: pointId,
          targetType: "wifi",
          wifiPointId: pointId,
          rating: validatedData.rating,
          comment: validatedData.comment,
        },
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
      });

      // Создаем запись о вкладе
      await tx.contribution.create({
        data: {
          userId,
          type: "add_review",
          points: 2, // 2 балла за отзыв
        },
      });

      // Обновляем баллы пользователя
      await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: 2 },
        },
      });

      return review;
    });

    return {
      success: true,
      data: {
        review: result,
        message: "Review added successfully",
        pointsEarned: 2,
      },
    };
  } catch (error: any) {
    console.error("[WiFi Review API] Error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to add review",
    });
  }
});

// AI проверка токсичности через Hugging Face
async function checkToxicity(text: string): Promise<boolean> {
  try {
    const config = useRuntimeConfig();
    const apiKey = config.huggingface?.apiKey;

    if (!apiKey) {
      console.warn(
        "[WiFi Review API] Hugging Face API key not configured, skipping toxicity check",
      );
      return false;
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
      console.warn(
        "[WiFi Review API] Toxicity check failed:",
        response.statusText,
      );
      return false;
    }

    const result = await response.json();

    // Проверяем результаты
    if (Array.isArray(result) && result[0]) {
      const labels = result[0];
      const toxicLabels = {
        toxic: labels.find((l: any) => l.label === "toxic")?.score || 0,
        severe_toxic: labels.find((l: any) => l.label === "severe_toxic")?.score || 0,
        obscene: labels.find((l: any) => l.label === "obscene")?.score || 0,
        threat: labels.find((l: any) => l.label === "threat")?.score || 0,
        insult: labels.find((l: any) => l.label === "insult")?.score || 0,
      };

      // Если любой из показателей выше 0.7 - блокируем
      if (Object.values(toxicLabels).some(score => score > 0.7)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("[WiFi Review API] Toxicity check error:", error);
    return false; // В случае ошибки пропускаем проверку
  }
}
