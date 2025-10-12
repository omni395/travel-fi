// server/api/wifi/[id]/security-report/[reportId].delete.ts
import { defineEventHandler, getRouterParam, createError } from "h3";
import prisma from "~/lib/prisma";
import { rewardService } from "~/services/reward.service";

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
        statusMessage: "You can only delete your own security reports",
      });
    }

    // Отзываем награды в транзакции
    await prisma.$transaction(async (tx) => {
      await tx.securityReport.delete({
        where: { id: reportId },
      });

      // Отзываем награды через reward service
      await rewardService.revokeSecurityReport(userId, reportId);
    });

    return {
      success: true,
      message: "Security report deleted successfully",
    };
  } catch (error: any) {
    console.error("[Security Report Delete API] Error:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete security report",
    });
  }
});
