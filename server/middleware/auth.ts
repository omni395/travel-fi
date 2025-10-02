import { defineEventHandler, getCookie, createError, getRequestHeader, getHeader, readBody, deleteCookie } from 'h3'
import { useRuntimeConfig } from '#imports' // Добавлено для useRuntimeConfig
import crypto from 'node:crypto'

const config = useRuntimeConfig()
const SECRET = config.secret || 'fallback-secret-change-in-prod'

// Типы для endpointAccess
interface EndpointRule {
  method: string;
  path: string;
}

// Конфигурация доступа к эндпоинтам
const endpointAccess = {
  public: [
    { method: '*', path: '/api/auth/*' }, // Расширено на all methods for auth API (login.post, register.post etc.)
    { method: '*', path: '/api/_auth/*' }, // Добавлено для nuxt-auth-utils session
    { method: 'POST', path: '/api/auth/login' },
    { method: 'POST', path: '/api/auth/register' },
    { method: 'POST', path: '/api/auth/forgot' },
    { method: 'POST', path: '/api/auth/siwe/verify' },
    { method: 'GET', path: '/api/wifi' },
    { method: 'GET', path: '/api/esim' },
    { method: 'GET', path: '/api/sitemap.xml' },
    { method: 'GET', path: '/' },
    { method: 'GET', path: '/en' },
    { method: 'GET', path: '/ru' },
    { method: 'GET', path: '/es' },
    { method: 'GET', path: '/zh' },
    { method: 'GET', path: '/_nuxt/' },
    { method: 'GET', path: '/assets/' },
    { method: 'GET', path: '/images/' },
    { method: 'GET', path: '/favicon.ico' },
    { method: 'GET', path: '/wifi' },
    { method: 'GET', path: '/esim' },
    { method: 'GET', path: '/about' },
    { method: 'GET', path: '/privacy' },
    { method: 'GET', path: '/terms' },
    { method: 'GET', path: '/api/csrf' },
    { method: 'GET', path: '/auth/*' },  // Auto-covers login/register/forgot with/without locale
  ] as EndpointRule[],
  auth: [
    { method: '*', path: '/api/dashboard' },
    { method: '*', path: '/api/profile' },
    { method: '*', path: '/api/contributions' },
    { method: '*', path: '/api/reviews' },
    { method: '*', path: '/api/notifications' },
    { method: '*', path: '/api/wifi/post' },
    { method: '*', path: '/api/esim/post' },
    { method: '*', path: '/api/security' },
    { method: '*', path: '/dashboard' },
    { method: '*', path: '/profile' },
  ] as EndpointRule[],
  admin: [
    { method: '*', path: '/api/admin' },
    { method: '*', path: '/api/moderation' },
    { method: '*', path: '/api/users' },
    { method: '*', path: '/admin' },
  ] as EndpointRule[],
  system: [
    { method: '*', path: '/api/cron/*' },
    { method: '*', path: '/api/ai/*' },
    { method: '*', path: '/api/services/*' },
  ] as EndpointRule[]
};

// Проверка системного запроса (по аналогии)
const isSystemRequest = (event: any) => {
  const systemToken = getRequestHeader(event, 'x-system-token')
  return systemToken === process.env.SYSTEM_TOKEN
}

// Универсальная функция для проверки совпадения путей (по аналогии)
function matchPathAndMethod(path: string, method: string, arr: EndpointRule[]): boolean {
  // Helper to strip i18n locale prefix (e.g. /ru/auth/login → /auth/login)
  const stripLocale = (p: string): string => {
    const localeMatch = p.match(/^\/([a-z]{2})(\/.*)$/);
    return localeMatch ? localeMatch[2] : p;
  };

  return arr.some((rule: EndpointRule) => {
    const methodMatch = rule.method === '*' || rule.method === method;
    if (!methodMatch) return false;

    const cleanPath = stripLocale(path).split('?')[0].replace(/\/$/, '');
    let cleanRule = rule.path.split('?')[0].replace(/\/$/, '');

    if (cleanRule.endsWith('/*')) {
      const prefix = cleanRule.slice(0, -2);
      return cleanPath.startsWith(prefix);
    } else {
      return cleanPath === cleanRule;
    }
  });
}

// Manual token verify (stateless, built-in crypto HMAC)
function verifyToken(token: string): { userId: number; role: string; exp: number } | null {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null

    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (signature !== expectedSignature) return null

    const [userIdStr, role, expStr] = data.split(':')
    const userId = parseInt(userIdStr, 10)
    const exp = parseInt(expStr, 10)

    if (isNaN(userId) || !role || isNaN(exp) || exp * 1000 < Date.now()) return null

    return { userId, role, exp }
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const path = event.path;
  const method = event.method;

  console.log(`Middleware debug: path=${path}, method=${method}, token=${getCookie(event, 'auth-token') ? 'present' : 'missing'}`); // Debug

  // Early return for public/static paths (no token needed)
  if (method === 'GET' && (
    path === '/' ||
    path.startsWith('/auth') ||
    path.startsWith('/wifi') ||
    path.startsWith('/esim') ||
    path.startsWith('/about') ||
    path.startsWith('/privacy') ||
    path.startsWith('/terms') ||
    path.startsWith('/_nuxt') ||
    path.startsWith('/assets') ||
    path.startsWith('/images') ||
    path === '/favicon.ico'
  )) {
    return;
  }

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

  // CSRF check for POST in auth/admin (global for state-changing)
  if (method === 'POST' && (matchPathAndMethod(path, method, endpointAccess.auth) || matchPathAndMethod(path, method, endpointAccess.admin))) {
    const csrfCookie = getCookie(event, 'csrf-token')
    if (!csrfCookie) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: CSRF token required'
      })
    }

    let bodyCsrf
    try {
      const body = await readBody(event)
      bodyCsrf = body._csrf || getHeader(event, 'x-csrf-token')
    } catch {
      bodyCsrf = getHeader(event, 'x-csrf-token')
    }

    if (bodyCsrf !== csrfCookie) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: Invalid CSRF token'
      })
    }

    // Single-use: Delete after validate
    deleteCookie(event, 'csrf-token')
  }

  // Verify token из cookie (stateless, no deps)
  const token = getCookie(event, 'auth-token');
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: No token'
    });
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid or expired token'
    });
  }

  const { userId, role } = payload;
  const isAdmin = role === 'admin' || role === 'moderator';

  // Админский доступ (по аналогии)
  if (isAdmin) {
    event.context.auth = {
      user: {
        id: userId,
        role,
        // Другие поля из payload если нужно
      }
    };
    return;
  }

  // Проверяем админские эндпоинты
  if (matchPathAndMethod(path, method, endpointAccess.admin)) {
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: Admin access required'
      });
    }
    event.context.auth = {
      user: {
        id: userId,
        role,
      }
    };
    return;
  }

  // Проверяем эндпоинты для авторизованных пользователей
  if (matchPathAndMethod(path, method, endpointAccess.auth)) {
    event.context.auth = {
      user: {
        id: userId,
        role,
      }
    };
    return;
  }

  // Отказ в доступе
  throw createError({
    statusCode: 403,
    message: 'Forbidden'
  });
})
