<template>
  <CustomCard color="error" class="mx-auto my-12" max-width="400">
    <v-row align="center" justify="center">
      <v-icon color="error" size="48">mdi-lock-alert</v-icon>
    </v-row>
    <v-row align="center" justify="center" class="mt-4">
      <h2 class="text-error">{{ t("access.forbiddenTitle") }}</h2>
    </v-row>
    <v-row align="center" justify="center" class="mt-2">
      <p>{{ t("access.forbiddenText") }}</p>
    </v-row>
  </CustomCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped>
.text-error {
  color: rgb(var(--v-theme-error));
  font-weight: 600;
  text-align: center;
}
</style>
