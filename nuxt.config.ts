import { defineNuxtConfig } from 'nuxt/config'

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
    // '@nuxtjs/seo', // Временно убрано, чтобы исключить конфликт
    //'@nuxtjs/sitemap',
    '@vite-pwa/nuxt',
    '@nuxtjs/leaflet',
    //'@nuxtjs/google-gtag',
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
              background: '#E1F5FE',
              btnBackground: '#4FC3F7',
              mainText: '#01579B',
              hoverText: '#0277BD'
            }
          }
        }
      }
    }
  },
  css: [
    //'~/assets/css/main.css',
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css'
  ],
  i18n: {
    vueI18n: './i18n.config.ts',
    bundle: {
      optimizeTranslationDirective: false
    }
  },
  sitemap: {
    siteUrl: 'https://travel-fi.com',
    sources: [
      async () => {
        const { $prisma } = useNuxtApp()
        const wifi = await $prisma.wifiPoint.findMany({ select: { id: true } })
        const esim = await $prisma.esimTariff.findMany({ select: { id: true } })
        return [
          ...wifi.map(w => ({ loc: `/wifi/${w.id}`, changefreq: 'weekly', priority: 0.6 })),
          ...esim.map(e => ({ loc: `/esim/${e.id}`, changefreq: 'weekly', priority: 0.6 }))
        ]
      }
    ],
    autoI18n: true
  },
  robots: {
    disallow: ['/admin'],
    allow: ['/', '/wifi', '/esim', '/leaderboard']
  },
  ogImage: {
    defaults: { title: 'TravelFi', description: 'Find Wi-Fi & eSIM, stay connected anywhere!' }
  },
  googleGtag: {
    id: 'G-XXXXXXXXXX'
  },
  pwa: {
    manifest: {
      name: 'TravelFi',
      short_name: 'TravelFi',
      description: 'Wi-Fi, eSIM, and secure travel',
      theme_color: '#0288D1'
    }
  },
  prisma: {
    autoSetupPrisma: true
  }
})
