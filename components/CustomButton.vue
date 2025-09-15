<template>
  <v-btn
    :color="color"
    class="white--text"
    v-bind="$attrs"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    :style="btnStyle"
  >
    <slot />
  </v-btn>
</template>
<script setup>
import { computed, ref } from 'vue'

defineProps({
  color: { type: String, default: 'primary' } // primary, secondary, accent
})

const hover = ref(false)
const btnStyle = computed(() => ({
  background: hover.value
    ? 'linear-gradient(90deg, #0288D1, #26A69A)' // primary → secondary
    : color === 'primary' ? '#0288D1' : color === 'secondary' ? '#26A69A' : '#FF5722'
}))
</script>
<style scoped>
.v-btn {
  transition: all 0.3s ease;
  min-width: 44px; /* Для touch */
}
</style>