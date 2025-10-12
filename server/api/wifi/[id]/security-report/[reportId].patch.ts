// server/api/wifi/[id]/security-report/[reportId].patch.ts
import { defineEventHandler, readBody, getRouterParam, createError } from "h3";
import { z } from "zod";
import prisma from "~/lib/prisma";

const securityReportUpdateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  risks: z.string().min(30).max(1000),
});

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth;
    if (!auth || !auth.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    const userId = auth.user.id;
    const reportId = parseInt(getRouterParam(event, "reportId") || "", 10);

    if (isNaN(reportId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid report ID",
      });
    }

    const existingReport = await prisma.securityReport.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      throw createError({
        statusCode: 404,
        statusMessage: "Security report not found",
      });
    }

    if (existingReport.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "You can only edit your own security reports",
      });
    }

    const body = await readBody(event);
    const validatedData = securityReportUpdateSchema.parse(body);

    // AI проверка токсичности описания рисков
    const isToxic = await checkToxicity(validatedData.risks);
    if (isToxic) {
      throw createError({
        statusCode: 400,
        statusMessage: "Report contains inappropriate content",
      });
    }

    const updatedReport = await prisma.securityReport.update({
      where: { id: reportId },
      data: validatedData,
    });

    return {
      success: true,
      data: updatedReport,
    };
  } catch (error: any) {
    console.error("[Security Report Update API] Error:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update security report",
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
        "[Security Report Update API] Hugging Face API key not configured, skipping toxicity check",
      );
      return false;
    }

    console.log("[Security Report Update API] Checking toxicity for text:", text.substring(0, 50) + "...");

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

    console.log("[Security Report Update API] Hugging Face response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        "[Security Report Update API] Toxicity check failed:",
        response.status,
        response.statusText,
        errorText
      );
      return false;
    }

    const result = await response.json();
    console.log("[Security Report Update API] Toxicity check result:", JSON.stringify(result));

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
    console.error("[Security Report Update API] Toxicity check error:", error);
    return false;
  }
}
