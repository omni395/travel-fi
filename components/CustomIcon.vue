<template>
  <v-icon :color="color" :icon="icon" class="travel-icon" :class="{ pulse: pulse }" v-bind="$attrs" />
</template>
<script setup>
defineProps({
  color: { type: String, default: 'primary' }, // primary, success, error
  icon: { type: String, default: 'mdi-wifi' },
  pulse: { type: Boolean, default: false }
})
</script>
<style scoped>
.travel-icon {
  transition: transform 0.3s ease;
}
.travel-icon.pulse {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>