<template>
  <v-progress-linear
    :model-value="value"
    :color="color"
    :background-color="backgroundColor"
    height="10"
    rounded
    v-bind="$attrs"
  >
    <slot />
  </v-progress-linear>
</template>
<script setup>
defineProps({
  value: { type: Number, default: 0 }, // 0-100
  color: { type: String, default: 'primary' }, // primary (#0288D1)
  backgroundColor: { type: String, default: 'secondary' } // secondary (#26A69A)
})
</script>
<style scoped>
.v-progress-linear {
  transition: all 0.5s ease;
}
</style>