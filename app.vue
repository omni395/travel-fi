<template>
  <v-app theme="travelFi">
    <NuxtLayout :name="$route.meta.layout || 'default'">
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCsrf } from '~/composables/useCsrf'

onMounted(() => {
  useCsrf()
})

useHead({
  title: 'TravelFi',
  meta: [
    { name: 'description', content: 'Find Wi-Fi & eSIM, stay connected anywhere!' },
    { name: 'theme-color', content: '#0288D1' },
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
  ],
});
</script>

<style scoped>
</style>
