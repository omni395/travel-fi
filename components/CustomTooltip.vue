<template>
  <v-tooltip
    :color="color"
    class="travel-tooltip"
    v-bind="$attrs"
  >
    <slot />
  </v-tooltip>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'accent' } // accent (#FF5722)
})
</script>
<style scoped>
.travel-tooltip .v-tooltip-content {
  background: rgb(var(--v-theme-accent));
  color: #FFFFFF;
  border-radius: 6px;
  transition: opacity 0.3s ease;
}
</style>