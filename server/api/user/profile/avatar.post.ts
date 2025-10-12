// server/api/user/profile/avatar.post.ts
import { createError } from "h3";
import prisma from "~/lib/prisma";
import { handleAvatarUpload } from "~/services/fileUpload.service";

export default defineEventHandler(async (event) => {
  console.log('AVATAR UPLOAD: auth payload=', JSON.stringify(event.context?.auth?.user));
  let authUser = event.context?.auth?.user;
  let user: any = null;
  try {
    if (authUser) {
      if ((authUser as any).id) user = authUser;
      else if ((authUser as any).userId) user = await prisma.user.findUnique({ where: { id: Number((authUser as any).userId) } });
    }
  } catch (err) {
    console.error('AVATAR UPLOAD: error fetching user from DB', err);
  }

  if (!user) {
    console.error('AVATAR UPLOAD: no authenticated user', event.context?.auth?.user);
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    console.log('AVATAR UPLOAD: starting parsing for user', user.id);
    const avatarUrl = await handleAvatarUpload(event.node.req);
    console.log('AVATAR UPLOAD: handleAvatarUpload returned', avatarUrl);

    if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.length < 5) {
      console.error('AVATAR UPLOAD: invalid avatarUrl', avatarUrl);
      throw createError({ statusCode: 400, statusMessage: "Пожалуйста, выберите изображение для загрузки" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        points: true,
        role: true,
        status: true,
        badges: true,
        leaderboardRank: true,
        profilePicture: true,
        pushEnabled: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        confirmedEmail: true,
      },
    });

    console.log('AVATAR UPLOAD: user updated', updatedUser.id);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_AVATAR",
        targetType: "User",
        targetId: user.id,
        result: "success",
        metadata: {
          avatarUrl,
        },
        ipAddress:
          event.node.req.headers["x-forwarded-for"]?.toString() ||
          event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    });

    return {
      success: true,
      user: updatedUser,
      message: "Avatar updated successfully",
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('AVATAR UPLOAD: error final', error);
    throw createError({ statusCode: 500, statusMessage: "Failed to upload avatar", data: { error: String(error) } });
  }
});
