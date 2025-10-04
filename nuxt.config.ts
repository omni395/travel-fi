import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@nuxtjs/i18n',
    'nuxt-auth-utils',
    '@prisma/nuxt',
    'vuetify-nuxt-module',
    'nuxt-toast',
    '@nuxtjs/seo',
    '@vite-pwa/nuxt',
    '@nuxtjs/leaflet',
    'nuxt-cron',
    '@vueuse/nuxt',
  ],
  
  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      theme: {
        defaultTheme: 'travelFi',
        themes: {
          travelFi: {
            dark: false,
            colors: {
              primary: '#0288D1',
              secondary: '#26A69A',
              accent: '#FF5722',
              error: '#D32F2F',
              warning: '#FFA000',
              info: '#0288D1',
              success: '#388E3C',
            },
          },
        },
      },
    },
  },

  i18n: {
    vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'EN' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'ру' },
      { code: 'es', iso: 'es-ES', file: 'es.json', name: 'ES' },
      { code: 'zh', iso: 'zh-CN', file: 'zh.json', name: '中文' },
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true, // Включаем куки для сохранения выбора
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    skipSettingLocaleOnNavigate: true,
  },

  hooks: {
    'i18n:beforeLocaleSwitch': ({ oldLocale, newLocale, initialSetup }) => {
      console.log(`i18n: Switching locale from ${oldLocale} to ${newLocale}, initialSetup: ${initialSetup}`);
    },
    'i18n:localeSwitched': ({ oldLocale, newLocale }) => {
      console.log(`i18n: Locale switched to ${newLocale} from ${oldLocale}`);
    },
  },

  vite: {
    build: {
      minify: false, // Отключаем минификацию для скорости
      rollupOptions: {
        maxParallelFileOps: 2, // Ограничиваем параллельные операции
      },
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },
  },

  site: {
    url: 'https://travel-fi.com',
    name: 'TravelFi',
    description: 'Find Wi-Fi & eSIM, stay connected anywhere!',
    defaultLocale: 'en',
    identity: {
      type: 'Organization',
    },
    twitter: '@travelfi',
  },
  sitemap: {
    sitemapName: 'sitemap.xml',
    siteUrl: 'https://travel-fi.com',
  },
  robots: {
    disallow: ['/admin'],
    allow: ['/', '/wifi', '/esim', '/leaderboard'],
    sitemap: 'https://travel-fi.com/api/sitemap.xml',
  },
  ogImage: {
    defaults: {
      title: 'TravelFi',
      description: 'Find Wi-Fi & eSIM, stay connected anywhere!',
      component: 'OgImage',
      width: 1200,
      height: 630,
    },
    fonts: ['Inter:400', 'Inter:500', 'Inter:600'],
  },
  schemaOrg: {
    identity: 'Organization',
    website: 'https://travel-fi.com',
    logo: 'https://travel-fi.com/logo.png',
  },
  googleGtag: {
    id: 'G-XXXXXXXXXX',
  },
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
    manifest: {
      name: 'TravelFi',
      short_name: 'TravelFi',
      description: 'Wi-Fi, eSIM, and secure travel',
      theme_color: '#0288D1',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg}'],
    },
    client: {
      installPrompt: true,
    },
  },
  prisma: {
    autoSetupPrisma: true,
  },
  runtimeConfig: {
    public: {
      oauth: {
        google: {
          clientId: process.env.NUXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID || ''
        }
      }
    },
    oauth: {
      google: {
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || '',
        redirectURL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL || '/api/auth/google'
      }
    }
  },
});
