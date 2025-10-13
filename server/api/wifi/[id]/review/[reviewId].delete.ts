// server/api/wifi/[id]/review/[reviewId].delete.ts
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
    const reviewId = parseInt(getRouterParam(event, "reviewId") || "", 10);

    if (isNaN(reviewId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid review ID",
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw createError({
        statusCode: 404,
        statusMessage: "Review not found",
      });
    }

    if (existingReview.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "You can only delete your own reviews",
      });
    }

    // Отзываем награды в транзакции с увеличенным таймаутом
    await prisma.$transaction(async (tx) => {
      // Получаем данные о награде
      const contribution = await tx.contribution.findFirst({
        where: {
          userId,
          targetId: reviewId,
          type: "add_review",
        },
      });

      // Удаляем отзыв
      await tx.review.delete({
        where: { id: reviewId },
      });

      if (contribution) {
        // Отзываем очки
        await tx.user.update({
          where: { id: userId },
          data: { points: { decrement: contribution.points } },
        });

        // Удаляем запись о награде
        await tx.contribution.delete({
          where: { id: contribution.id },
        });
      }
    }, {
      // Увеличиваем таймаут до 10 секунд
      timeout: 10000,
    });

    return {
      success: true,
      message: "Review deleted successfully",
    };
  } catch (error: any) {
    console.error("[Review Delete API] Error:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete review",
    });
  }
});
