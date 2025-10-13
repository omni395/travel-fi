// server/api/wifi/[id]/security-report.post.ts
import { defineEventHandler, readBody, getRouterParam, createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

// Валидация данных отчета о безопасности
const securityReportSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(30).max(500),
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

    // Получаем и валидируем данные
    const body = await readBody(event);

    let validatedData;
    try {
      validatedData = securityReportSchema.parse(body);
    } catch (validationError: any) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid security report data",
        data: validationError.errors,
      });
    }

    // Проверяем, не отправлял ли пользователь уже отчет на эту точку
    const existingReport = await prisma.securityReport.findFirst({
      where: {
        userId,
        wifiPointId: pointId,
      },
    });

    if (existingReport) {
      throw createError({
        statusCode: 409,
        statusMessage: "You have already reported security issue for this Wi-Fi point",
      });
    }

    // AI проверка токсичности описания рисков
    const isToxic = await checkToxicity(validatedData.comment);
    if (isToxic) {
      throw createError({
        statusCode: 400,
        statusMessage: "Report contains inappropriate content",
      });
    }



    // Создаем отчет и начисляем баллы в транзакции
    const result = await prisma.$transaction(async (tx: any) => {
      // Создаем отчет о безопасности
      const report = await tx.securityReport.create({
        data: {
          userId,
          wifiPointId: pointId,

          rating: validatedData.rating,
          comment: validatedData.comment,
          status: "pending", // требует проверки модератором
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
      const contribution = await tx.contribution.create({
        data: {
          userId,
          type: "security_report",
          points: 3, // 3 балла за отчет о безопасности
          reportId: report.id,
        },
      });

      // Обновляем баллы пользователя
      await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: 3 },
        },
      });

      return { report, contribution };
    });

    return {
      success: true,
      data: {
        report: result.report,
        message: "Security report submitted successfully",
        pointsEarned: 3,
      },
    };
  } catch (error: any) {
    console.error("[WiFi Security Report API] Error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to submit security report",
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
        "[WiFi Security Report API] Hugging Face API key not configured, skipping toxicity check",
      );
      return false;
    }

    console.log("[WiFi Security Report API] Checking toxicity for text:", text.substring(0, 50) + "...");
    
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

    console.log("[WiFi Security Report API] Hugging Face response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        "[WiFi Security Report API] Toxicity check failed:",
        response.status,
        response.statusText,
        errorText
      );
      return false;
    }

    const result = await response.json();
    console.log("[WiFi Security Report API] Toxicity check result:", JSON.stringify(result));

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
    console.error("[WiFi Security Report API] Toxicity check error:", error);
    return false; // В случае ошибки пропускаем проверку
  }
}
