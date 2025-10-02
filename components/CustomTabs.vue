<template>
  <v-tabs
    :model-value="tab"
    @update:model-value="val => { tab = val; $emit('update:modelValue', val) }"
    :color="color"
    class="travel-tabs"
    v-bind="$attrs"
  >
    <slot />
  </v-tabs>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null }
})
const emit = defineEmits(['update:modelValue'])

const tab = ref(props.modelValue)
defineProps({
  color: { type: String, default: 'primary' } // primary (#0288D1)
})
</script>

<style scoped>
.travel-tabs .v-tab--active {
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  color: #FFFFFF;
  transition: all 0.3s ease;
}
.travel-tabs .v-tabs-slider {
  background-color: rgb(var(--v-theme-accent));
}
</style>