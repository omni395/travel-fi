<template>
  <v-container>
    <v-alert v-if="!isOffline" type="error" color="error" class="mb-4">
      {{ t('offline_message') }}
    </v-alert>

    <!-- Hero Section -->
    <v-row class="hero-section" align="center" :class="{ 'full-height': isMobile }">
      <v-col cols="12" md="6">
        <h1 class="text-primary text-h3 font-weight-bold">{{ t('slogan') }}</h1>
        <p class="text-secondary text-h6 mt-4">{{ t('hero_subtitle') }}</p>
        <CustomButton to="/signup" color="accent" variant="elevated" size="large" class="mt-4">
          {{ t('get_started') }}
        </CustomButton>
      </v-col>
      <v-col cols="12" md="6">
        <v-img src="/assets/images/hero-image.png" alt="TravelFi Hero" max-height="400" />
      </v-col>
    </v-row>

    <!-- Features Section -->
    <v-row class="mt-8">
      <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="3">
        <CustomCard>
          <v-card-title class="text-primary">{{ feature.title }}</v-card-title>
          <v-card-text>
            <CustomIcon :name="feature.icon" color="primary" size="large" />
            <p class="mt-2 text-primary">{{ feature.description }}</p>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import CustomButton from '@/components/CustomButton.vue';
import CustomCard from '@/components/CustomCard.vue';
import CustomIcon from '@/components/CustomIcon.vue';
import CustomAlert from '@/components/CustomAlert.vue';

const { t } = useI18n();
const isOffline = useOnline();
const isMobile = useMediaQuery('(max-width: 600px)');

useHead({
  title: 'TravelFi - Wi-Fi & eSIM for Travelers',
  meta: [
    { name: 'description', content: t('slogan') },
    { name: 'keywords', content: 'travel Wi-Fi, best eSIM Europe' },
    { property: 'og:title', content: 'TravelFi - Wi-Fi & eSIM for Travelers' },
    { property: 'og:description', content: t('slogan') },
    { property: 'og:image', content: '/assets/images/og-image.png' },
  ],
});

const features = [
  { title: t('features.wifi'), icon: 'mdi-wifi', description: t('features.wifi_desc') },
  { title: t('features.esim'), icon: 'mdi-sim', description: t('features.esim_desc') },
  { title: t('features.security'), icon: 'mdi-shield', description: t('features.security_desc') },
  { title: t('features.gamification'), icon: 'mdi-trophy', description: t('features.gamification_desc') },
];
</script>

<style scoped>
.hero-section {
  min-height: 60vh;
}
.full-height {
  min-height: 100vh;
}
</style>
