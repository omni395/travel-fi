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

    // Отзываем награды в транзакции
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      // Отзываем награды через reward service
      await rewardService.revokeReview(userId);
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
