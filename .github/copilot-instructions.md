# Copilot Instructions for Travel-Fi

Ответы давать исключительно на русском языке.
Перед ответом всегда думай шаг за шагом и проверяй себя на наличие ошибок.
Если нет явного запроса, не придумывай его.
Если не можешь решить задачу однозначно, задай уточняющий вопрос.
Внимательно читай контекст и следуй инструкциям.
Внимательно изучай документацию и код проекта.
Изучать проект и его документацию, чтобы понять его архитектуру, технологии и рабочие процессы.
Изучать используемые технологии, модули и библиотеки. Модули добавлять только в той момент, когда они действительно нужны, а те, которые используются действительно не могут быть реализованы с помощью уже имеющихся.
Понимать архитектуру проекта, включая фронтенд, бэкенд, модели данных и потоки данных.
Понимать рабочие процессы разработки, включая настройку, управление
Приложение работает через докер. команды запускать ТОЛЬКО через докер компос окружение.
Быть в курсе соглашений и шаблонов, используемых в проекте, включая соглашения по именованию, структуру API, i18n, аутентификацию и безопасность, геймификацию и обработку ошибок.

## Project Overview
Travel-Fi is a Nuxt 4 Progressive Web App (PWA) for travelers to find and add Wi-Fi hotspots and eSIM tariffs. It features gamification with TRAVEL points, badges (Beginner to Legend), leaderboards, referrals, and security checks using AI (Hugging Face). The app supports multilingual UI (en, ru, es, zh) and plans WhatsApp bot integration via Twilio. Core data models include User, WifiPoint, EsimTariff, Contribution, Review, SecurityReport, Feature, UserFeature, Session, AuditLog, managed via Prisma with PostgreSQL. Authentication uses nuxt-auth-utils with email/password, Google OAuth, and SIWE (Metamask). The app is Dockerized for development, with Redis for sessions/caching and cron jobs for maintenance (e.g., check-features.ts).

Key goals: Enable secure, gamified discovery of connectivity options; reward contributions; integrate Web3 for token-based rewards (ERC-20 on Polygon via ethers.js).

## Architecture
- **Frontend**: Vue 3 with TypeScript, Vuetify 3 for UI (custom theme 'travelFi' with primary #0288D1 in nuxt.config.ts). Pages in `pages/` (e.g., index.vue for home, dashboard.vue for user stats, admin/index.vue for moderation). Components in `components/` use wrappers like CustomButton.vue, CustomCard.vue for consistent styling (prefix 'Custom' for custom Vuetify extensions). Layouts via `layouts/default.vue` with NavBar.vue and Footer.vue.
- **Backend**: Server-side rendering with Nuxt server routes in `server/api/` (e.g., auth/login.post.ts uses bcrypt/Zod validation, session.get.ts queries Prisma). Middleware `middleware/auth.ts` protects routes like /dashboard. Composables in `composables/` for shared logic (e.g., useUser.ts for auth state). Plugins like i18n.client.ts for localization.
- **Data Flow**: Prisma client in `lib/prisma.ts` for DB interactions. User sessions stored in Prisma Session model (JWT tokens, with fields like userAgent, ipAddress, isActive). Contributions update User.points and badges array atomically via $transaction. AI integrations (e.g., security checks) via @huggingface/inference in server/services/. Features managed via Feature and UserFeature models for premium access (e.g., offlineMaps expiresAt).
- **PWA/Offline**: @vite-pwa/nuxt for installable app with offline caching (navigateFallback: '/' in nuxt.config.ts). Leaflet maps via @nuxtjs/leaflet for Wi-Fi location pinning in CustomMap.vue.
- **SEO/Meta**: @nuxtjs/seo auto-generates sitemap.xml (/api/sitemap.xml.get.ts from Prisma), robots.txt (/api/robots.txt.get.ts), Open Graph in app.vue and pages. Site config in nuxt.config.ts with url: 'https://travel-fi.com'.

Example: Adding a Wi-Fi point in pages/wifi.vue uses CustomForm with Leaflet map, posts to /api/wifi.post.ts, which creates WifiPoint via Prisma, awards points via Contribution, and triggers moderation (status: 'pending').

## Development Workflows
- **Setup**: Use Docker Compose (`docker-compose up --build --remove-orphans`) for app (port 3000), Postgres (5432), Redis (6379). Env vars in .env (e.g., DATABASE_URL=postgresql://user:password@postgres:5432/travel_fi). Run `npm install` inside container if needed. Scripts from package.json: `npm run dev` for HMR on localhost:3000.
- **DB Management**: `npm run prisma:migrate` for schema changes (e.g., add fields to User in prisma/schema.prisma). `npm run prisma:seed` with prisma/seed.js for mock data. Use Prisma Studio (`npm run prisma:studio`) for visual inspection. Always run Prisma commands inside Docker or set DATABASE_URL locally.
- **Run Dev**: `npm run dev` (HMR on localhost:3000). For production: `npm run build` then `npm run preview`. Debug auth with console logs in server/api/auth/session.get.ts.
- **Testing/Debug**: No dedicated tests; use browser devtools for PWA install prompts (PWAInstall.vue). Check cron jobs via nuxt-cron (server/cron/check-features.ts runs daily to expire UserFeature). For i18n testing, set cookie 'i18n_redirected' manually. Use nuxt-toast for UI notifications.
- **Deploy**: Render/DigitalOcean with Docker; set env vars for OAuth (NUXT_OAUTH_GOOGLE_CLIENT_ID in runtimeConfig), Hugging Face API, VAPID keys for web-push.

Non-obvious: Transpile 'vuetify' in nuxt.config.ts build for compatibility. Use vite options for HMR and minify=false in dev.

## Conventions and Patterns
- **UI**: Prefix custom Vuetify components with 'Custom' (e.g., CustomDialog.vue extends v-dialog with travel-themed props). Use CSS vars like rgb(var(--v-theme-primary)) in assets/css/main.css. Colors from nuxt.config.ts theme (primary: '#0288D1'). Avoid hard-coded HEX; use color="primary" props.
- **API**: Server routes use .post.ts/.get.ts files with async defineEventHandler. Validate inputs with Zod (e.g., in auth/register.post.ts: z.object({email: z.string().email()})). Return { data, error } objects. Use runtimeConfig for secrets (e.g., oauth.google.clientId). Protect with server/middleware/auth.ts checking getUser().
- **i18n**: Keys in locales/*.json (e.g., 'nav.dashboard': { en: 'Dashboard', ru: 'Дашборд' }). Use $t('key') in templates; auto-detect via browser (detectBrowserLanguage in nuxt.config.ts), persist in cookie (cookieKey: 'i18n_redirected'). skipSettingLocaleOnNavigate: true.
- **Auth/Security**: Protect pages with middleware/auth.ts (checks session via nuxt-auth-utils). Sessions expire after 7-30 days; rotate on login (invalidate old in POST /api/auth/login). Hash passwords with bcrypt (rounds 12) in server/api/auth/register.post.ts. Rate-limit via nuxt-security. For SIWE: nonce in /api/auth/siwe/nonce.get.ts, verify signature in verify.post.ts with ethers.js.
- **Gamification**: Update User.points atomically in Prisma $transaction (e.g., in server/api/contribution.post.ts). Badges as User.badges array (e.g., push 'Bronze' on 10 contributions). Leaderboard via raw SQL: await prisma.$queryRaw`SELECT * FROM "User" ORDER BY points DESC`.
- **Error Handling**: Use nuxt-toast for UI (e.g., showError({ title: $t('error.network') }) in composables). Server errors: console.log, return { error: { message: i18nKey } } with 400/401 status.

Example pattern in server/api/wifi.post.ts:
```ts
import { z } from 'zod'
const schema = z.object({ lat: z.number(), ssid: z.string() })
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)
  const wifi = await prisma.wifiPoint.create({ data: { ...validated, userId: getUser(event).id } })
  await prisma.$transaction(async (tx) => {
    await tx.contribution.create({ data: { userId: wifi.userId, type: 'add_wifi', points: 2 } })
    await tx.user.update({ where: { id: wifi.userId }, data: { points: { increment: 2 } } })
  })
  return { data: { id: wifi.id }, success: true }
})
```

## Integrations and External Dependencies
- **DB/ORM**: Prisma 5+ with Postgres; migrations in prisma/migrations/. Auto-generate client via @prisma/nuxt in nuxt.config.ts.
- **Auth**: nuxt-auth-utils for sessions/JWT (Session model with token, expiresAt, isActive); Google via runtimeConfig.oauth (scopes: email, profile); SIWE in server/api/auth/siwe/ with ethers.js nonce verification (EIP-4361).
- **AI/ML**: @huggingface/inference for sentiment (detoxify in server/services/review.service.ts?), ranking (sentence-transformers) in services/feature.service.ts and email.service.ts (Nodemailer for confirmations via server/services/email.service.ts).
- **Maps/Push**: Leaflet for geolocation (useGeolocation from @vueuse/nuxt in pages/wifi.vue); web-push for notifications (VAPID keys in env, PushSubscription model).
- **Web3**: ethers.js for Metamask connect in auth/siwe/ (walletAddress in User); Moralis for token balances in dashboard.vue (if walletAddress set, query ERC-20 TRAVEL on Polygon).
- **Other**: Twilio for WhatsApp bot (env vars in .env); @nuxtjs/google-gtag for analytics; nuxt-cron for scheduled tasks (server/cron/check-features.ts: expire UserFeature where expiresAt < now()). @mdi/font for icons in css.

Cross-component: UsePinia stores sparingly; prefer composables (e.g., useAuth composable calls /api/auth/session.get.ts). For AI calls, cache in Redis (e.g., via nuxt-auth-utils session storage). Use Custom components for UI consistency (e.g., CustomButton with color="primary").

---
