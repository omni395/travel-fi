<template>
<<<<<<< HEAD
  <div class="terms-page">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h1>{{ t('nav.terms') }}</h1>
          <p v-html="termsContent"></p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const termsContent = computed(() => {
  return t('terms.content') || '<p>Условия использования TravelFi. Это заглушка для страницы условий.</p>'
})
</script>

<style scoped>
.terms-page {
  min-height: 100vh;
  padding: 2rem 0;
}
</style>
=======
  <v-container>
    <v-card-title class="text-h4">Terms of Service</v-card-title>
    <v-card-text>
      <p>Terms content here.</p>
    </v-card-text>
  </v-container>
</template>

<script setup>
useHead({
  title: 'Terms - TravelFi'
})
</script>
>>>>>>> authentication
