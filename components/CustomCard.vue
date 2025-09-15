<template>
  <v-card class="travel-card" elevation="2" v-bind="$attrs">
    <slot />
  </v-card>
</template>
<script setup>
defineProps({
  borderColor: { type: String, default: 'accent' } // accent (#FF5722)
})
</script>
<style scoped>
.travel-card {
  border-radius: 12px;
  border-left: 4px solid #FF5722; /* accent */
  background: linear-gradient(135deg, #0288D1 0%, #26A69A 100%);
  color: #FFFFFF;
  transition: transform 0.3s ease;
}
.travel-card:hover {
  transform: scale(1.02);
}
</style>