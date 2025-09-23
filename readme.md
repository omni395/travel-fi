### Задачи приложения
1. **Поиск**:
   - Wi-Fi: по геолокации ("ближайший Wi-Fi") или тегам ("cafe", "free").
   - eSIM: по регионам/странам ("eSIM для Европы").
2. **Добавление**:
   - Wi-Fi: через карту (Leaflet) или WhatsApp (/add wifi).
   - eSIM: форма или /add esim Airalo "Europe" 10GB $10.
3. **Безопасность**: Проверка сетей (AI Hugging Face), рекомендации VPN.
4. **Геймификация**: Баллы/токены TRAVEL, бейджи (Beginner, Bronze, Silver, Gold, Platinum, Legend), лидерборд.
5. **Рефералка**: AI-матчинг по гео, +5 TRAVEL за друга.
6. **Пуш-уведомления**: Web Push/WhatsApp ("Новый Wi-Fi рядом", "Рисковая сеть").

### Логика работы
1. **Вход**: PWA (travel-fi.com) или /start (WhatsApp). Авторизация: email, Google OAuth, Metamask.
2. **Дашборд**: Vuetify, показывает TRAVEL баллы, бейджи, лидерборд, уведомления.
3. **Поиск**: /chat "eSIM для Европы" или /find wifi nearby. AI (Hugging Face) ранжирует по рейтингу, цене, гео.
4. **Добавление**: Wi-Fi (Leaflet, геолокация), eSIM (форма). Status: pending → AI-токсичность + модерация. +1–3 TRAVEL.
5. **Отзывы**: /review wifi 123 4 "Fast". AI-анализ (Hugging Face detoxify). +0.5 TRAVEL.
6. **Безопасность**: /check security → SecurityReport (AI-риски, VPN). +3 TRAVEL.
7. **Геймификация**: Milestone (5/10/50/100/250/500 вкладов) → бейджи, бонусы TRAVEL, фичи (offlineMaps, aiAnalysis).
8. **Рефералка**: AI-матчинг (ReferralSuggestion) → +5 TRAVEL за друга.
9. **Пуш**: Web Push/WhatsApp ("Bronze unlocked!", "Wi-Fi в 1км").
10. **Обмен**: Redeem 100 TRAVEL → скидка $5 (Airalo). Премиум-фичи за TRAVEL.

### Фичи
- **PWA**: 
  - [x] Offline-режим (частично: кэш user в dashboard.vue)
  - [x] Web Push
  - [x] Кнопка установки приложения
  - [ ] Leaflet карты (в процессе)
- **WhatsApp-бот**: /find, /add, /review, /check security (Twilio, не реализовано).
- **AI**:
  - [ ] Поиск: Ранжировка eSIM/Wi-Fi (Hugging Face, sentence-transformers)
  - [ ] Рефералка: Матчинг по гео (User.lastLocation)
  - [ ] Безопасность: Анализ рисков, токсичности отзывов (Hugging Face detoxify)
- **SEO**:
  - [x] @nuxtjs/seo с базовой конфигурацией
  - [x] Автоматическая генерация sitemap.xml
  - [x] Настройка robots.txt
  - [x] Open Graph разметка
  - [x] Schema.org разметка
- **Web3**: 
  - [ ] TRAVEL как ERC-20 токен (Polygon mainnet, ethers.js)
  - [x] Базовая интеграция Metamask (в процессе)
- **i18n**:
  - [x] Поддержка языков: en, ru, es, zh
  - [x] Автоопределение языка
  - [x] Переключение языка в интерфейсе

### Плюшки (геймификация)
- **Beginner (5 вкладов)**: Бейдж, +3 TRAVEL, offlineMaps (3 дня).
- **Bronze (10 вкладов)**: Бейдж, +5 TRAVEL, скидка +5% (Affiliate).
- **Silver (50 вкладов)**: Бейдж, +10 TRAVEL, aiAnalysis (7 дней), приоритет в поиске.
- **Gold (100 вкладов)**: Бейдж, +20 TRAVEL, вечный offlineMaps, стикеры в боте.
- **Platinum (250 вкладов)**: Бейдж, +50 TRAVEL, вечный aiAnalysis, скидка +10%.
- **Legend (500 вкладов)**: Бейдж, +100 TRAVEL, кастом аватар, персональный AI-гид.

---

## План разработки
**Длительность**: MVP за 14–21 день, полный запуск за 6–8 недель. Всё в Docker (node:22-alpine), без локального Node.js. Хостинг: Render (free tier) → DigitalOcean (Droplet, $6/мес). Домен: travel-fi.com (~$10/год, Namecheap).

### Этап 1: Подготовка (Дни 1–3) [Выполнено на 80%]
- **Выполнено**:
  - [x] Репозиторий и базовая структура проекта
  - [x] Настройка Docker с Postgres и Redis
  - [x] Базовая конфигурация Nuxt 4 с TypeScript
  - [x] Интеграция Vuetify 3 с кастомной темой
  - [x] Настройка PWA с кнопкой установки
  - [x] Базовая SEO-оптимизация
  - [x] Мультиязычность (i18n) с 4 языками
  - [x] Базовая аутентификация (в процессе)
  - [x] Модели Prisma и миграции

- **В процессе**:
  - [ ] Интеграция с Twilio для WhatsApp-бота
  - [ ] Настройка AI-моделей (Hugging Face)
  - [ ] Интеграция Web3 (Metamask)

- **Осталось**:
  - [ ] Купить домен: travel-fi.com (Namecheap)
  - [ ] Настроить DNS и HTTPS
  - [ ] Настроить CI/CD пайплайн
- **Результат**: Репозиторий, Docker, база, домен.

### Этап 2: Авторизация и дашборд (Дни 4–7) [Частично завершён]
- **Сделано**:
  - Дашборд: `dashboard.vue` (Vuetify, User.points, badges, leaderboardRank, notifications, referrals, mock-данные).
  - Авторизация: `auth.js` (middleware, базовая логика перенаправления).
  - UI: `NavBar.vue`, `Footer.vue`, `CustomMenu.vue` (навигация, футер, выбор языка).
  - i18n: Локали `en`, `ru`, `es`, `zh` с переводом, автоопределение языка.
- **Осталось**:
  - Авторизация: Email/password (bcrypt), Google OAuth, Metamask (nuxt-auth-utils, ethers.js). JWT в Session.
  - Бот: Twilio (/start, /login).
  - Prisma: Реальные запросы для User, Session, UserFeature (заменить mock-данные).
- **Результат**: Логин (PWA/бот), дашборд (баллы, бейджи).

### Этап 3: Wi-Fi и eSIM (Дни 8–12)
- **Задачи**:
  - Wi-Fi: Форма (Vuetify v-form, Leaflet для lat/lng), геолокация (vueuse useGeolocation), Nominatim (axios). Prisma: WifiPoint (tags, proximityScore, connectionType).
  - eSIM: Форма (provider, countries, carrier). Prisma: EsimTariff (regions, dataSpeed, roamingSupport).
  - Бот: /add wifi, /add esim, /find wifi nearby, /find esim Europe.
  - Геймификация: Contribution (add_wifi/add_esim, +1–2 TRAVEL), User.badges (Beginner/Bronze).
- **Результат**: Добавление/поиск Wi-Fi/eSIM, базовая геймификация.

### Этап 4: Отзывы и безопасность (Дни 13–17)
- **Задачи**:
  - Отзывы: Форма (Vuetify v-text-field), Review (rating, aiSentiment via Hugging Face detoxify). Бот: /review wifi 123 4 "Fast".
  - Безопасность: SecurityReport (AI-risks, vpnRecommendations). AI (Hugging Face) для токсичности/рисков.
  - Модерация: Админка (Vuetify v-data-table, role: "moderator"), AuditLog. AI auto-approve (toxicity <0.5).
  - Геймификация: Contribution (review/security, +0.5–3 TRAVEL), User.badges (Silver).
- **Результат**: Отзывы, безопасность, модерация, уровни.

### Этап 5: AI и чатбот (Дни 18–21)
- **Задачи**:
  - Чатбот: PWA (Vuetify v-text-field, /chat "eSIM для Европы"), бот (/chat). Hugging Face (DialoGPT) для парсинга, поиск по EsimTariff/WifiPoint.
  - AI: Ранжировка eSIM (regions, carrier), Wi-Fi (proximityScore). Персонализация (User.travelPreferences).
  - Рефералка: ReferralSuggestion (AI-match по lastLocation). Пуш: "Поделись в Tokyo".
  - Лидерборд: API (/api/leaderboard), Vuetify v-data-table, AI: "Добавь 2 Wi-Fi для #3".
- **Результат**: AI-поиск, чатбот, рефералки, лидерборд.

### Этап 6: Пуш и аффилиаты (Дни 22–28)
- **Задачи**:
  - Пуш: Web Push (web-push, PushSubscription), WhatsApp (Twilio). Notification (wifi_nearby, security_alert, action: "view_leaderboard").
  - Аффилиаты: Affiliate (Airalo, NordVPN), redeem 100 TRAVEL → $5 скидка.
  - Геймификация: Gold/Platinum (User.badges), пуш: "Bronze unlocked!".
- **Результат**: Пуш-уведомления, аффилиаты, геймификация.

### Этап 7: Web3 и SEO (Дни 29–42)
- **Сделано**:
  - SEO: Meta-теги в `app.vue`, `index.vue`, `dashboard.vue` (description, keywords, og:image).
- **Осталось**:
  - Web3: TRAVEL токен (ERC-20, @openzeppelin/contracts) на Polygon mainnet (ethers.js, moralis). Если walletAddress — mint TRAVEL, иначе points.
  - Блог: Nuxt Content, 5–10 постов.
  - Тестирование: Deploy на Render (Docker). Тест на 10–20 юзеров (Reddit r/digitalnomad).
- **Результат**: Web3, SEO, MVP.

### Этап 8: Запуск и маркетинг (Дни 43–56)
- **Задачи**:
  - Запуск: Product Hunt, Reddit (r/travel, r/web3), NomadList. Instagram/TikTok ("Wi-Fi лайфхаки").
  - Рефералка: +5 TRAVEL за друга. Пуш: "Ты #5 в лидерборде!".
  - Геймификация: Legend (500 вкладов), кастом аватар.
  - Монетизация: Аффилиаты ($100–200 с 1000 юзеров), премиум ($2/мес).
- **Результат**: 1000 юзеров, $100–200/мес, полный функционал.

---

## Таблицы Prisma
Файл: `prisma/schema.prisma`. Все таблицы для функционала TravelFi.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             Int                @id @default(autoincrement())
  email          String             @unique
  password       String?            // Hashed, null for OAuth/Web3
  walletAddress  String?            // Metamask
  points         Int                @default(0) // TRAVEL
  role           String             @default("user") // user, admin, moderator
  referralCode   String?            @unique
  pushEnabled    Boolean            @default(false)
  lastLocation   Json?              // {lat, lng}
  language       String             @default("en")
  travelPreferences Json?           // {countries: [], budget: 20}
  badges         String[]?          // ["Contributor Bronze"]
  leaderboardRank Int?              // Cached rank
  profilePicture    String?         // User avatar URL
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
  sessions       Session[]
  contributions  Contribution[]
  reviews        Review[]
  referrals      ReferralSuggestion[] @relation("user")
  suggested      ReferralSuggestion[] @relation("suggestedUser")
  features       UserFeature[]
  notifications  Notification[]
}

model UserFeature {
  id        Int       @id @default(autoincrement())
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  feature   String    // "offlineMaps", "aiAnalysis"
  enabled   Boolean   @default(true)
  expiresAt DateTime?
  createdAt DateTime  @default(now())
}

model Session {
  id        String    @id @default(uuid())
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  token     String    @unique // JWT
  expiresAt DateTime
  createdAt DateTime  @default(now())
}

model AuditLog {
  id         Int       @id @default(autoincrement())
  userId     Int       // Админ/модератор
  user       User      @relation(fields: [userId], references: [id])
  action     String    // "approve_wifi", "delete_esim"
  entityId   Int
  entityType String    // "wifi", "esim", "security"
  createdAt  DateTime  @default(now())
}

model WifiPoint {
  id          Int          @id @default(autoincrement())
  location    String       // "Cafe Paris"
  latitude    Float
  longitude   Float
  speed       Float?       // Mbps
  password    String?      // Null если открытая
  security    String?      // "WPA3", "WPA2"
  rating      Float?       @default(0)
  tags        String[]?    // ["cafe", "free"]
  verifiedAt  DateTime?
  source      String?      // "map", "bot"
  proximityScore Float?     // Для "ближайший"
  connectionType String?    // "public", "private", "paid"
  lastActive  DateTime?    // Последняя активность
  userId      Int
  user        User         @relation(fields: [userId], references: [id])
  status      String       @default("pending")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  reviews     Review[]
  contributions Contribution[]
}

model EsimTariff {
  id          Int          @id @default(autoincrement())
  provider    String       // "Airalo"
  countries   String[]?    // ["Japan", "Thailand"]
  regions     String?      // "Europe"
  data        Float        // GB
  price       Float        // USD
  currency    String       @default("USD")
  duration    Int          // Days
  rating      Float?       @default(0)
  validUntil  DateTime?
  qrCode      String?
  roamingSupport Boolean   @default(true)
  carrier     String?      // "Vodafone"
  dataSpeed   String?      // "4G", "5G"
  userId      Int
  user        User         @relation(fields: [userId], references: [id])
  status      String       @default("pending")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  reviews     Review[]
  contributions Contribution[]
}

model SecurityReport {
  id             Int          @id @default(autoincrement())
  wifiId         Int?
  wifi           WifiPoint?   @relation(fields: [wifiId], references: [id])
  security       String       // "WPA3", "open"
  risks          String?      // "MITM risk"
  vpnRecommendations String[]? // ["NordVPN"]
  aiConfidence   Float?       // Уверенность AI
  scanSource     String?      // "user", "ai", "bot"
  userId         Int
  user           User         @relation(fields: [userId], references: [id])
  status         String       @default("pending")
  createdAt      DateTime     @default(now())
  contributions  Contribution[]
}

model Contribution {
  id             Int          @id @default(autoincrement())
  userId         Int
  user           User         @relation(fields: [userId], references: [id])
  entityType     String       // "wifi", "esim", "security"
  contributionType String?     // "add_wifi", "add_esim", "review", "security"
  entityId       Int
  points         Int          // 1, 2, 3, 0.5
  status         String       @default("pending")
  levelAchieved  Boolean      @default(false)
  createdAt      DateTime     @default(now())
}

model Review {
  id             Int          @id @default(autoincrement())
  userId         Int
  user           User         @relation(fields: [userId], references: [id])
  entityType     String       // "wifi", "esim"
  entityId       Int
  rating         Int          // 1-5
  comment        String?
  aspects        Json?        // {quality: 4, actual: true}
  isVerified     Boolean      @default(false)
  aiSentiment    Float?       // AI-тональность
  moderationNote String?      // Причина отказа
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model Affiliate {
  id          Int       @id @default(autoincrement())
  provider    String    // "Airalo"
  discount    Float     // USD (5.0)
  travelCost  Int       // TRAVEL (100)
  link        String    // Affiliate URL
  createdAt   DateTime  @default(now())
}

model ReferralSuggestion {
  id             Int       @id @default(autoincrement())
  userId         Int
  user           User      @relation("user", fields: [userId], references: [id])
  suggestedUserId Int
  suggestedUser  User      @relation("suggestedUser", fields: [suggestedUserId], references: [id])
  aiScore        Float     // Уверенность AI
  createdAt      DateTime  @default(now())
}

model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  type      String    // "wifi_nearby", "esim_promo", "security_alert"
  content   String    // "New Wi-Fi at Cafe Paris"
  read      Boolean   @default(false)
  action    String?   // "view_leaderboard", "add_wifi"
  createdAt DateTime  @default(now())
}

model PushSubscription {
  id        Int       @id @default(autoincrement())
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  endpoint  String    // Web Push endpoint
  keys      Json      // {p256dh, auth}
  createdAt DateTime  @default(now())
}

---

## Обновления (сентябрь 2025)
- SEO: включён `@nuxtjs/seo`; сайткарта генерируется в рантайме по адресу `/api/sitemap.xml` (данные из Prisma). `robots.txt` указывает на новую ссылку.
- Папки: `layout/` переименована в `layouts/`; `server/middlware/` → `server/middleware/`.
- Ассеты: исправлены опечатки в именах (`beginner-*`, `bronze-logo-*`).
- Логотипы перемещены в `public/images/` и подключаются через `/images/logo-1.png`.
- Cron: исправлена тайм‑зона на `Europe/Kyiv`.
- PWA: иконки `pwa-*.png` будут добавлены в `public/`.

---

## Предложения по авторизации и аутентификации (Этап 2)

### Стек
- `nuxt-auth-utils` для сессий/JWT, `@prisma/client` для пользователей/сессий, `bcrypt` для паролей, `zod` для валидации.
- Google OAuth (OAuth 2.0), Metamask через `ethers.js` и SIWE (EIP‑4361).

### Email/Пароль
1. Регистрация: `POST /api/auth/register` → валидация (zod), хэш пароля (`bcrypt` 12–14), создание `User`, выдача `Session` (`token`, `expiresAt`).
2. Логин: `POST /api/auth/login` → проверка пароля, ротация сессии (инвалидация старой), новая `Session` (TTL 7–30 дней).
3. Выход: `POST /api/auth/logout` → удаление/инвалидация текущей `Session`.
4. Сброс пароля: `POST /api/auth/forgot` (одноразовый токен + письмо), `POST /api/auth/reset` (смена пароля, ротация всех сессий).

### Google OAuth
1. `GET /api/auth/google/start` → редирект на Google (scopes: email, profile) с `state`/PKCE.
2. `GET /api/auth/google/callback` → обмен кода на токен, получение профиля; поиск/создание `User` по email; создание `Session`.
3. Безопасность: проверка `state`; чувствительные операции (смена email) — пароль/2FA.

### Metamask (SIWE)
1. `GET /api/auth/siwe/nonce` → выдача nonce, кратковременное хранение на сервере.
2. `POST /api/auth/siwe/verify` → проверка подписи и nonce; привязка `walletAddress` к `User` (создание при отсутствии), выдача `Session`.

### Сессии и куки
- `Session` (Prisma): `id` (uuid), `userId`, `token` (JWT, уникальный), `expiresAt`, `createdAt`.
- Токен в httpOnly secure cookie (`SameSite=Lax`, `Secure` в проде).
- Серверное middleware: проверка JWT и валидности `Session` на защищённых маршрутах.

### Безопасность
- Пароли: `bcrypt` + «перец» (server secret), минимальная длина 8–10.
- Rate limiting: логин/регистрация/forgot — 5–10 попыток/мин по IP и email/кошельку.
- CSRF: SameSite или отдельные CSRF‑токены для форм/POST.
- 2FA (опционально на 2–3 этапе): TOTP через `otplib` для чувствительных действий.

### UI и бот
- UI: страницы `Login`, `Register`, кнопки Google/Metamask, компонент привязки кошелька.
- Бот (Twilio): `/start` отдаёт magic‑link/код; `/login` принимает код и создаёт сессию, связывая WhatsApp ↔ аккаунт.

---

## Темизация и переменные
- Цвета в компонентах переведены на CSS‑переменные Vuetify: `rgb(var(--v-theme-primary))`, `rgb(var(--v-theme-secondary))`, `rgb(var(--v-theme-accent))` и т.д.
- Рекомендуется избегать жёстких HEX‑значений в стилях. Используйте тему через переменные или пропсы Vuetify (`color="primary"`).
- Добавление/изменение цветов — в `nuxt.config.ts → vuetify.vuetifyOptions.theme.themes.travelFi.colors`.
