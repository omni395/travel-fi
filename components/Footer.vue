<template>
  <v-footer color="primary" class="text-white">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <span>{{ t('footer.copyright') }} &copy; 2025 TravelFi</span>
        </v-col>
        <v-col cols="12" md="6" class="text-right">
          <NuxtLink :to="$localePath('/terms')" class="text-white mx-2">{{ t('footer.terms') }}</NuxtLink>
          <NuxtLink :to="$localePath('/privacy')" class="text-white mx-2">{{ t('footer.privacy') }}</NuxtLink>
          <CustomIcon name="mdi-twitter" color="accent" class="mx-2" />
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import CustomIcon from '@/components/CustomIcon.vue';

const { t } = useI18n();
</script>

<style scoped>
.text-white {
  color: white !important;
}
</style>
