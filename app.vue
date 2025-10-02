<template>
  <v-app theme="travelFi">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
//import { useHead } from '@vueuse/head';
import { provide, onMounted } from 'vue'
import { useUser } from '~/composables/useUser'

const { user, isAuthenticated, isAdmin, fetchUser } = useUser()  // Added destructuring

// Make provide reactive
provide('user', user)
provide('isAuthenticated', isAuthenticated)
provide('isAdmin', isAdmin)

// On client mount, fetch user to sync after hydration
if (process.client) {
  onMounted(async () => {
    await fetchUser()
  })
}

useHead({
  title: 'TravelFi - Find Wi-Fi & eSIM, stay connected anywhere!',
  meta: [
    { name: 'description', content: 'Discover free Wi-Fi, affordable eSIMs, and secure connections worldwide.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' },
    { name: 'theme-color', content: '#0288D1' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'apple-touch-icon', href: '/assets/images/logo-1.png' }
  ]
})

// i18n и другие глобальные
const { locale } = useI18n()
watch(locale, (newLocale) => {
  document.documentElement.lang = newLocale
})

watch(user, (newUser) => {
  console.log('User changed in app.vue:', newUser); // Лог изменения user
});
</script>

<style>
/* Глобальные стили для PWA и тем */
html, body {
  overflow-x: hidden;
}

#__nuxt {
  min-height: 100vh;
}

.v-application {
  font-family: 'Roboto', sans-serif;
}
</style>
