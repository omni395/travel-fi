# Copilot Instructions for Travel-Fi

Общие принципы работы:
1. Ответы давать исключительно на русском языке
2. Перед ответом всегда думать шаг за шагом и проверять себя
3. Не придумывать запросы при их отсутствии
4. Задавать уточняющие вопросы при неоднозначности
5. Внимательно изучать контекст, документацию и код

Правила работы:
1. Все команды выполнять ТОЛЬКО через Docker Compose
2. Модули добавлять только при реальной необходимости
3. Следовать установленным соглашениям по коду
4. Использовать атомарные транзакции для критических операций
5. Валидировать данные на бэкенде через Zod
6. Проверять безопасность через AI-сервисы

## Project Overview
Travel-Fi — это прогрессивное веб-приложение (PWA) на базе Nuxt 4 для путешественников, позволяющее находить и добавлять точки Wi-Fi и тарифы eSIM. Основные функции:
- Система геймификации с очками TRAVELFI
- Система бейджей от "Beginner" до "Legend"
- Рейтинги и реферальная система
- Проверка безопасности с помощью AI (Hugging Face)
- Мультиязычный интерфейс (en, ru, es, zh)
- Интеграция с WhatsApp через Twilio (в планах)

Ключевые модели данных (через Prisma с PostgreSQL):
- User, Session - управление пользователями и сессиями
- WifiPoint, EsimTariff - основные сущности
- Contribution, Review, SecurityReport - пользовательский контент
- Feature, UserFeature - управление премиум-функциями

Основные технологии:
- Аутентификация: nuxt-auth-utils (email/пароль, Google OAuth, SIWE/Metamask)
- База данных: PostgreSQL + Prisma
- Кэширование: Redis
- Web3: ethers.js (токены ERC-20 на Polygon)
- Фоновые задачи: nuxt-cron

## Architecture

### Frontend (Vue 3 + TypeScript)
- Компоненты:
  - Все кастомные компоненты с префиксом 'Custom' (например, `CustomButton.vue`)
  - Обязательно использование темы через Vuetify props (color="primary" вместо хардкода)
  - Layouts: `layouts/default.vue` + `NavBar.vue` + `Footer.vue`
- Страницы:
  - Основные в `pages/` (index.vue, dashboard.vue, etc.)
  - Админка в `pages/admin/`
  - Защищенные через `middleware/auth.ts`

### Backend
- API роуты в `server/api/`:
  - Валидация через Zod
  - Атомарные транзакции через Prisma
  - Формат ответа: { data, error }
- Сервисы в `server/services/`:
  - AI-проверки через Hugging Face
  - Web Push уведомления
  - Интеграция с Web3
- Безопасность:
  - Rate limiting через nuxt-security
  - Проверка сессий (7-30 дней)
  - bcrypt для паролей (12 раундов)

### Важные шаблоны
1. API Endpoints:
```ts
// server/api/wifi.post.ts
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

2. Формы безопасности:
```vue
<!-- components/SecurityReportForm.vue -->
<template>
  <CustomForm v-model="form" @submit="submit">
    <CustomSelect v-model="form.risks" :items="riskTypes" />
    <CustomRating v-model="form.rating" />
    <CustomTextarea v-model="form.comment" counter maxLength="500" />
  </CustomForm>
</template>
```

## Development Workflow

### Основные команды:
```bash
# Запуск разработки
docker-compose up --build --remove-orphans

# Работа с БД
docker-compose exec app npm run prisma:migrate  # Миграции
docker-compose exec app npm run prisma:studio   # GUI для БД
docker-compose exec app npm run prisma:seed     # Тестовые данные

# Сборка
docker-compose exec app npm run build
docker-compose exec app npm run preview
```

### Особенности отладки:
- PWA: через PWAInstall.vue и devtools
- i18n: cookie 'i18n_redirected'
- Аутентификация: логи в session.get.ts
- Cron задачи: через nuxt-cron

### Важно помнить:
1. Все команды только через Docker
2. Валидация на бэкенде через Zod
3. Атомарные транзакции для очков/бейджей
4. Префикс 'Custom' для компонентов
5. Переводы через $t() и JSON файлы

## Integrations
- Hugging Face API: проверка контента
- Google OAuth: аутентификация
- SIWE/Metamask: Web3 авторизация
- Twilio: WhatsApp бот
- Web Push: уведомления
- Polygon/Moralis: токены TRAVELFI

## Conventions
1. **Naming**:
   - Компоненты: PascalCase с префиксом Custom
   - API: kebab-case для URL
   - i18n ключи: camelCase с точками

2. **Code Style**:
   - TypeScript везде
   - Composition API для Vue
   - Zod для валидации
   - Атомарные транзакции

3. **Security**:
   - Валидация на бэкенде
   - Rate limiting
   - Проверка прав
   - Санитизация через AI

4. **Performance**:
   - Redis кэширование
   - PWA для оффлайн
   - Lazy loading
   - HMR оптимизации

---
