<template>
  <v-app theme="travelFi">
    <v-overlay
      v-model="isLoading"
      class="align-center justify-center"
      :scrim="true"
      scrim-color="#0288D1"
      opacity="0.8"
    >
      <v-img
        src="/assets/images/logo-1.png"
        alt="TravelFi Logo"
        max-width="200"
        max-height="200"
        class="mx-auto"
      />
    </v-overlay>
    <NuxtLayout :name="$route.meta.layout || 'default'">
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Заглушка показывается до полной загрузки страницы
const isLoading = ref(true);

onMounted(() => {
  // Скрываем заглушку после загрузки страницы
  window.addEventListener('load', () => {
    isLoading.value = false;
  });
});

// Очистка обработчика событий
onBeforeUnmount(() => {
  window.removeEventListener('load', () => {
    isLoading.value = false;
  });
});

useHead({
  title: 'TravelFi',
  meta: [
    { name: 'description', content: 'Find Wi-Fi & eSIM, stay connected anywhere!' },
    { name: 'theme-color', content: '#0288D1' },
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/assets/images/favicon.png' },
  ],
});
</script>

<style scoped>
.v-overlay {
  z-index: 1000; /* Убедимся, что заглушка выше всего контента */
}
</style>