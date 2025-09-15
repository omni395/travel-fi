<template>
  <v-tabs
    v-model="tab"
    :color="color"
    class="travel-tabs"
    v-bind="$attrs"
  >
    <slot />
  </v-tabs>
</template>
<script setup>
import { ref } from 'vue'

const tab = ref(null)
defineProps({
  color: { type: String, default: 'primary' } // primary (#0288D1)
})
</script>
<style scoped>
.travel-tabs .v-tab--active {
  background: linear-gradient(90deg, #0288D1, #26A69A); /* primary → secondary */
  color: #FFFFFF;
  transition: all 0.3s ease;
}
.travel-tabs .v-tabs-slider {
  background-color: #FF5722; /* accent */
}
</style>