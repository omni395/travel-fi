<template>
  <v-alert
    :type="type"
    :color="color"
    class="travel-alert"
    v-bind="$attrs"
  >
    <slot />
  </v-alert>
</template>
<script setup>
defineProps({
  type: { type: String, default: 'success' }, // success, error, warning, info
  color: { type: String, default: 'success' } // success (#388E3C), error (#D32F2F)
})
</script>
<style scoped>
.travel-alert {
  border-radius: 8px;
  border: 1px solid #FF5722; /* accent */
  transition: opacity 0.3s ease;
}
</style>