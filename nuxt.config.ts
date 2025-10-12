import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },

  build: {
    transpile: ["vuetify"],
  },

  experimental: {
    payloadExtraction: false,
  },

  app: {
    head: {
      title: 'TravelFi - Find Wi-Fi & eSIM',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0288D1' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },
  modules: [
    "@nuxtjs/i18n",
    "nuxt-auth-utils",
    "@prisma/nuxt",
    "vuetify-nuxt-module",
    "nuxt-toast",
    "@nuxtjs/seo",
    "@vite-pwa/nuxt",
    "nuxt-cron",
    "@vueuse/nuxt",
  ],

  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      theme: {
        defaultTheme: "travelFi",
        themes: {
          travelFi: {
            dark: false,
            colors: {
              primary: "#0288D1", // primary color from theme
              secondary: "#26A69A",
              accent: "#FF5722",
              error: "#D32F2F",
              warning: "#FFA000",
              info: "#0288D1",
              success: "#388E3C",
            },
          },
        },
      },
    },
  },

  i18n: {
    vueI18n: "./i18n.config.ts",
    strategy: "prefix_except_default",
    locales: [
      { code: "en", iso: "en-US", file: "en.json", name: "EN" },
      { code: "ru", iso: "ru-RU", file: "ru.json", name: "ру" },
      { code: "es", iso: "es-ES", file: "es.json", name: "ES" },
      { code: "zh", iso: "zh-CN", file: "zh.json", name: "中文" },
    ],
    defaultLocale: "en",
    langDir: "locales",
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
        protocol: "ws",
        host: "localhost",
      },
    },
  },

  site: {
    url: "https://travel-fi.com",
    name: "TravelFi",
    description: "Find Wi-Fi & eSIM, stay connected anywhere!",
    defaultLocale: "en",
    identity: {
      type: "Organization",
    },
    twitter: "@travelfi",
  },
  sitemap: {
    sitemapName: "sitemap.xml",
  },
  robots: {
    disallow: ["/admin"],
    allow: ["/", "/wifi", "/esim", "/leaderboard"],
    sitemap: "https://travel-fi.com/api/sitemap.xml",
  },
  ogImage: {
    defaults: {
      width: 1200,
      height: 630,
    },
  },
  schemaOrg: {
    identity: "Organization",
  },

  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "apple-touch-icon.png"],
    manifest: {
      name: "TravelFi",
      short_name: "TravelFi",
      description: "Wi-Fi, eSIM, and secure travel",
      theme_color: "#0288D1",
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-maskable-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "pwa-maskable-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg}"],
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
          clientId: process.env.NUXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID || "",
        },
      },
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "",
      tokenAddress: process.env.TOKEN_CONTRACT_ADDRESS || "",
      polygonRPC: process.env.POLYGON_RPC_URL || "",
    },
    oauth: {
      google: {
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || "",
        redirectURL:
          process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL || "/api/auth/google",
      },
    },
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY || "",
    },
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "",
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || "",
    tokenPrivateKey: process.env.TOKEN_PRIVATE_KEY || "",
  },
});
