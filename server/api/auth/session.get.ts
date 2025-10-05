import prisma from "~/lib/prisma";
import { getCookie, defineEventHandler } from "h3";
import crypto from "node:crypto";

const config = useRuntimeConfig();
const SECRET = config.secret || "fallback-secret-change-in-prod";

// Функция проверки токена
function verifyToken(
  token: string,
): { userId: number; role: string; exp: number } | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");
    if (signature !== expectedSignature) return null;

    const [userIdStr, role, expStr] = data.split(":");
    const userId = parseInt(userIdStr, 10);
    const exp = parseInt(expStr, 10);

    if (isNaN(userId) || !role || isNaN(exp) || exp * 1000 < Date.now())
      return null;

    return { userId, role, exp };
  } catch {
    return null;
  }
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth-token");
  console.log("Session API: token present:", !!token);

  if (!token) {
    console.log("Session API: No token found");
    return { user: null };
  }

  const payload = verifyToken(token);
  console.log("Session API: token payload:", payload);

  if (!payload) {
    console.log("Session API: Invalid token");
    return { user: null };
  }

  const sessionUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      confirmedEmail: true,
      walletAddress: true,
      points: true,
      role: true,
      referralCode: true,
      pushEnabled: true,
      lastLocation: true,
      language: true,
      travelPreferences: true,
      badges: true,
      leaderboardRank: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log(
    "Session API: user found:",
    !!sessionUser,
    sessionUser?.id,
    sessionUser?.role,
  );

  if (!sessionUser) {
    console.log(
      "Session API: User not found in database for userId:",
      payload.userId,
    );
    return { user: null };
  }

  console.log("Session API: Returning user:", sessionUser.email);
  return { user: sessionUser };
});
