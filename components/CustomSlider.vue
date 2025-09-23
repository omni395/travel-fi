<template>
  <v-slider
    :color="color"
    :track-color="trackColor"
    class="travel-slider"
    v-bind="$attrs"
  />
</template>
<script setup>
defineProps({
  color: { type: String, default: 'accent' }, // accent (#FF5722)
  trackColor: { type: String, default: 'secondary' } // secondary (#26A69A)
})
</script>
<style scoped>
.travel-slider {
  transition: all 0.3s ease;
}
.travel-slider .v-slider-thumb {
  background: rgb(var(--v-theme-accent));
}
</style>