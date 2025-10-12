import prisma from "~~/lib/prisma";
import { getCookie, deleteCookie, getHeader } from "h3";
import crypto from "node:crypto";
import { writeAudit } from "~/services/audit";

const config = useRuntimeConfig();
const SECRET = config.secret || "fallback-secret-change-in-prod";

function getIp(event: any) {
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return String(xff).split(',')[0].trim()
  return event.node?.req?.socket?.remoteAddress || ''
}

function verifyToken(
  token: string,
): { userId: number; role: string; exp: number } | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (signature !== expectedSignature) return null;
    const [userIdStr, role, expStr] = data.split(":");
    const userId = parseInt(userIdStr, 10);
    const exp = parseInt(expStr, 10);
    if (isNaN(userId) || !role || isNaN(exp) || exp * 1000 < Date.now()) return null;
    return { userId, role, exp };
  } catch {
    return null;
  }
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth-token");
  let userId: number | undefined
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId
      await prisma.session.deleteMany({ where: { userId: payload.userId } });
    }
    deleteCookie(event, "auth-token", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  await writeAudit({
    userId,
    action: 'auth.logout',
    targetType: 'Auth',
    result: 'success',
    ipAddress: getIp(event),
    userAgent: getHeader(event, 'user-agent') || ''
  })

  return { success: true };
});