import {
  defineEventHandler,
  getCookie,
  createError,
  getRequestHeader,
  getHeader,
  readBody,
  deleteCookie,
} from "h3";
import crypto from "node:crypto";
import prisma from "~/lib/prisma";

const config = useRuntimeConfig();
const SECRET = config.secret || "fallback-secret-change-in-prod";

// Типы для endpointAccess
interface EndpointRule {
  method: string;
  path: string;
}

// Конфигурация доступа к эндпоинтам
const endpointAccess = {
  public: [
    { method: "*", path: "/api/auth/*" },
    { method: "*", path: "/api/_auth/*" },
    { method: "POST", path: "/api/auth/login" },
    { method: "POST", path: "/api/auth/signup" },
    { method: "POST", path: "/api/auth/forgot" },
    { method: "POST", path: "/api/auth/siwe/verify" },
    { method: "GET", path: "/api/wifi" },
    { method: "GET", path: "/api/esim" },
    { method: "GET", path: "/api/sitemap.xml" },
    { method: "GET", path: "/" },
    { method: "GET", path: "/en" },
    { method: "GET", path: "/ru" },
    { method: "GET", path: "/es" },
    { method: "GET", path: "/zh" },
    { method: "GET", path: "/_nuxt/" },
    { method: "GET", path: "/assets/" },
    { method: "GET", path: "/images/" },
    { method: "GET", path: "/favicon.ico" },
    { method: "GET", path: "/wifi" },
    { method: "GET", path: "/esim" },
    { method: "GET", path: "/about" },
    { method: "GET", path: "/privacy" },
    { method: "GET", path: "/terms" },
    { method: "GET", path: "/api/csrf" },
    { method: "GET", path: "/auth/*" },
    { method: "POST", path: "/api/user/check-email" },
    { method: "POST", path: "/api/user/check-wallet" },
    { method: "POST", path: "/api/user/upload-profile-picture" },
    { method: "GET", path: "/manifest.webmanifest" },
    { method: "GET", path: "/pwa-*" },
    { method: "GET", path: "/apple-touch-icon*" },
    { method: "GET", path: "/android-chrome-*" },
    { method: "GET", path: "/safari-pinned-tab.svg" },
  ] as EndpointRule[],
  auth: [
    { method: "GET", path: "/api/dashboard" },
    { method: "GET", path: "/api/profile" },
    { method: "GET", path: "/api/contributions" },
    { method: "GET", path: "/api/reviews" },
    { method: "*", path: "/api/notifications" },
    { method: "POST", path: "/api/wifi" },
    { method: "POST", path: "/api/wifi/*/security-report" },
    { method: "PATCH", path: "/api/wifi/*/update" },
    { method: "DELETE", path: "/api/wifi/*" },
    { method: "PATCH", path: "/api/wifi/*/review/*" },
    { method: "DELETE", path: "/api/wifi/*/review/*" },
    { method: "PATCH", path: "/api/wifi/*/security-report/*" },
    { method: "DELETE", path: "/api/wifi/*/security-report/*" },
    { method: "POST", path: "/api/esim" },
    { method: "*", path: "/api/security" },
    { method: "*", path: "/dashboard" },
    { method: "*", path: "/profile" },
    { method: "POST", path: "/api/user/update" },
    { method: "GET", path: "/api/user/profile/stats" },
    { method: "PATCH", path: "/api/user/profile" },
    { method: "POST", path: "/api/user/profile/avatar" },
    { method: "PATCH", path: "/api/user/profile/push" },
    { method: "POST", path: "/api/user/profile/wallet" },
    { method: "DELETE", path: "/api/user/profile/wallet" },
  ] as EndpointRule[],
  admin: [
    { method: "*", path: "/api/admin/*" },
    { method: "*", path: "/api/users/*" },
    { method: "*", path: "/api/wifi/*" },
    { method: "*", path: "/api/settings/*" },
    { method: "*", path: "/admin/*" },
  ] as EndpointRule[],
  system: [
    { method: "*", path: "/api/cron/*" },
    { method: "*", path: "/api/ai/*" },
    { method: "*", path: "/api/services/*" },
  ] as EndpointRule[],
};

// Проверка системного запроса (по аналогии)
const isSystemRequest = (event: any) => {
  const systemToken = getRequestHeader(event, "x-system-token");
  return systemToken === process.env.SYSTEM_TOKEN;
};

// Универсальная функция для проверки совпадения путей (по аналогии)
function matchPathAndMethod(
  path: string,
  method: string,
  arr: EndpointRule[],
): boolean {
  // Helper to strip i18n locale prefix (e.g. /ru/auth/login → /auth/login)
  const stripLocale = (p: string): string => {
    const localeMatch = p.match(/^\/([a-z]{2})(\/.*)$/);
    return localeMatch ? localeMatch[2] : p;
  };

  return arr.some((rule: EndpointRule) => {
    const methodMatch = rule.method === "*" || rule.method === method;
    if (!methodMatch) return false;

    const cleanPath = stripLocale(path).split("?")[0].replace(/\/$/, "");
    let cleanRule = rule.path.split("?")[0].replace(/\/$/, "");

    if (cleanRule.endsWith("/*")) {
      const prefix = cleanRule.slice(0, -2);
      return cleanPath.startsWith(prefix);
    } else {
      return cleanPath === cleanRule;
    }
  });
}

// Top-level helper to strip locale prefix from a path (reused elsewhere)
function stripLocale(path: string): string {
  const match = path.match(/^\/([a-z]{2})(\/.*)$/);
  return match ? match[2] : path;
}

// Manual token verify (stateless, built-in crypto HMAC)
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
  const path = event.path;
  const method = event.method;

  // Проверяем только API эндпоинты, страницы пропускаем
  if (!path.startsWith("/api/")) {
    return;
  }

  // Исключаем специальные роуты Nuxt
  if (
    path.startsWith("/_nuxt") ||
    path.startsWith("/assets") ||
    path.startsWith("/images") ||
    path === "/favicon.ico" ||
    path.startsWith("/__nuxt_error") ||
    path.startsWith("/@") ||
    path.includes("hot-update") ||
    path.includes("manifest.webmanifest") ||
    path.match(/\/pwa-\d+x\d+\.png$/) ||
    path.match(/\/apple-touch-icon.*\.png$/) ||
    path.match(/\/android-chrome-.*\.png$/) ||
    path.match(/\/safari-pinned-tab\.svg$/)
  ) {
    return;
  }

  console.log(
    `Server middleware debug: path=${path}, method=${method}, token=${getCookie(event, "auth-token") ? "present" : "missing"}`,
  );

  const publicMatch = matchPathAndMethod(path, method, endpointAccess.public);

  if (publicMatch) {
    return;
  }

  // Проверяем системные эндпоинты
  if (matchPathAndMethod(path, method, endpointAccess.system)) {
    if (isSystemRequest(event)) {
      return;
    }
  }

  // CSRF check for all POST (global for state-changing)
  if (method === "POST") {
    const csrfCookie = getCookie(event, "csrf-token");
    if (!csrfCookie) {
      throw createError({ statusCode: 403, message: "Forbidden: CSRF token required" });
    }

    // csrfCookie is signed as '<csrf>.<signature>' in /api/csrf
    const parts = String(csrfCookie).split(".");
    if (parts.length !== 2) {
      throw createError({ statusCode: 403, message: "Forbidden: Invalid CSRF cookie format" });
    }

    const [cookieCsrf, cookieSignature] = parts;
    const expectedSig = crypto.createHmac("sha256", SECRET).update(cookieCsrf).digest("base64url");
    if (cookieSignature !== expectedSig) {
      throw createError({ statusCode: 403, message: "Forbidden: Invalid CSRF cookie signature" });
    }

    let bodyCsrf;
    try {
      // If this is a multipart/form-data request (file upload), do not call readBody()
      // because that would consume the request stream and make formidable on the
      // route handler hang waiting for data. Use header x-csrf-token in that case.
      const contentType = String(getHeader(event, 'content-type') || '').toLowerCase();
      if (contentType.startsWith('multipart/')) {
        bodyCsrf = getHeader(event, 'x-csrf-token');
      } else {
        const body = await readBody(event);
        bodyCsrf = body?._csrf || getHeader(event, 'x-csrf-token');
      }
    } catch (err) {
      bodyCsrf = getHeader(event, "x-csrf-token");
    }

    if (!bodyCsrf || String(bodyCsrf) !== cookieCsrf) {
      throw createError({ statusCode: 403, message: "Forbidden: Invalid CSRF token" });
    }

    // Single-use: Delete after validate
    deleteCookie(event, "csrf-token");
  }

  // Verify token из cookie (stateless, no deps)
  const token = getCookie(event, "auth-token");
  if (!token) {
    console.log(`Server middleware: No token for ${path}`);
    throw createError({
      statusCode: 401,
      message: "Unauthorized: No token",
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    console.log(`Server middleware: Invalid token for ${path}`);
    throw createError({
      statusCode: 401,
      message: "Unauthorized: Invalid or expired token",
    });
  }

  const { userId, role } = payload;
  const isAdmin = role === "admin" || role === "moderator";

  // Проверяем админские API эндпоинты
  if (matchPathAndMethod(path, method, endpointAccess.admin)) {
    if (!isAdmin) {
      console.log(
        `Server middleware: Admin access denied for ${path}, user role: ${role}`,
      );
      throw createError({
        statusCode: 403,
        message: "Forbidden: Admin access required",
      });
    }
    console.log(`Server middleware: Admin access granted for ${path}`);
    event.context.auth = {
      user: {
        id: userId,
        role,
      },
    };
    return;
  }

  // Проверяем API эндпоинты для авторизованных пользователей
  if (matchPathAndMethod(path, method, endpointAccess.auth)) {
    const user = await prisma.user.findUnique({
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
    if (!user) {
      console.log(`Server middleware: User not found in DB for ${path}`);
      throw createError({
        statusCode: 401,
        message: "Unauthorized: User not found",
      });
    }
    // Проверяем confirmedEmail и заполненное имя только для API изменений (POST/PUT/DELETE),
    // кроме PATCH /api/user/profile и POST /api/user/profile/avatar (разрешаем их всегда)
    if (
      path.startsWith("/api/") &&
      method !== "GET" &&
      !(
        (method === "PATCH" && stripLocale(path) === "/api/user/profile") ||
        (method === "POST" && stripLocale(path) === "/api/user/profile/avatar") ||
        (method === "POST" && stripLocale(path) === "/api/user/profile/wallet") ||
        (method === "POST" && stripLocale(path).match(/^\/api\/wifi\/\d+\/security-report$/)) ||
        (method === "PATCH" && stripLocale(path).match(/^\/api\/wifi\/\d+\/update$/)) ||
        (method === "DELETE" && stripLocale(path).match(/^\/api\/wifi\/\d+$/))
      )
    ) {
      if (!user.confirmedEmail || !user.name) {
        console.log(`Server middleware: Profile incomplete for ${path}. confirmedEmail=${user.confirmedEmail}, name=${user.name}`);
        throw createError({
          statusCode: 403,
          message: "complete_profile",
        });
      }
    }
    console.log(`Server middleware: Auth access granted for ${path}`);
    event.context.auth = {
      user: user,
    };
    return;
  }

  // Отказ в доступе только для API
  console.log(`Server middleware: Access denied for ${path}, role: ${role}`);
  throw createError({
    statusCode: 403,
    message: "Forbidden",
  });
});
