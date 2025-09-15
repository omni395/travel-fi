<template>
  <v-chip :color="color" :prepend-icon="icon" class="travel-chip" v-bind="$attrs">
    <slot />
  </v-chip>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'secondary' }, // secondary (#26A69A)
  icon: { type: String, default: 'mdi-wifi' }
})
</script>
<style scoped>
.travel-chip {
  transition: transform 0.3s ease;
}
.travel-chip:hover {
  transform: scale(1.1);
}
</style>