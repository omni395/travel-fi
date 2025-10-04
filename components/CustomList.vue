<template>
  <v-list
    :color="color"
    class="travel-list"
    v-bind="$attrs"
  >
    <slot />
  </v-list>
</template>

<script setup>
defineProps({
  color: { type: String, default: 'secondary' },
  inheritBg: { type: Boolean, default: true }
})
</script>

<style scoped>
.travel-list {
  background: transparent !important; /* Transparent to inherit parent background */
}

.travel-list .v-list-item {
  transition: background 0.3s ease, opacity 0.3s ease;
}

.travel-list .v-list-item:hover {
  background: var(--list-hover-bg, rgba(var(--v-theme-secondary), 0.1)); /* Subtle overlay fallback */
  opacity: 0.9;
}

.travel-list, .travel-list * {
  color: #FFFFFF !important;
}
</style>