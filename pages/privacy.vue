<template>
  <div class="privacy-page">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1>{{ t('nav.privacy') }}</h1>
          <p v-html="privacyContent"></p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const privacyContent = computed(() => {
  return t('privacy.content') || '<p>Политика конфиденциальности TravelFi. Это заглушка для страницы политики.</p>'
})
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  padding: 2rem 0;
}
</style>