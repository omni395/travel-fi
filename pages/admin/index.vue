<!-- pages/admin/index.vue -->
<template>
  <v-container fluid class="pa-6" :style="{ background: 'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)', minHeight: 'calc(100vh - 64px)' }">
    <div class="d-flex align-center justify-space-between mb-4">
      <v-breadcrumbs class="pa-0" :style="{ color: 'white' }"><template #divider><v-icon size="small">mdi-chevron-right</v-icon></template></v-breadcrumbs>
      <h1 class="text-h4 mb-0 text-white">{{ t('admin.title') }}</h1>
    </div>

    <CustomCard>
      <template #title>{{ t('admin.title') }}</template>
      <p>{{ t('admin.description') }}</p>
    </CustomCard>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CustomCard from '@/components/CustomCard.vue'
const { t } = useI18n()
definePageMeta({ layout: 'admin' })
</script>