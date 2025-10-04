<template>
  <v-card class="travel-card" elevation="2" v-bind="$attrs">
    <slot />
  </v-card>
</template>

<script setup>
defineProps({
  borderColor: { type: String, default: 'secondary' } // secondary (#26A69A)
})
</script>

<style scoped>
.travel-card {
  border-radius: 16px;
  border-left: 4px solid rgb(var(--v-theme-secondary));
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  color: #FFFFFF;
  transition: background 0.4s ease, box-shadow 0.4s ease;
  --list-hover-bg: rgba(var(--v-theme-primary), 0.1); /* Subtle overlay for child lists */
}

.travel-card:hover {
  background: linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%);
  box-shadow: 0 8px 32px rgba(38, 166, 154, 0.2);
}

.travel-card * {
  color: #FFFFFF !important;
}

@media (max-width: 600px) {
  .travel-card {
    border-left: none;
    border: 2px solid rgb(var(--v-theme-secondary));
  }
}
</style>