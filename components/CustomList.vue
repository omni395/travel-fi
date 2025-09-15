<template>
  <v-list
    :color="color"
    class="travel-list"
    v-bind="$attrs"
  >
    <slot />
  </v-list>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'secondary' } // secondary (#26A69A)
})
</script>
<style scoped>
.travel-list .v-list-item {
  transition: background 0.3s ease;
}
.travel-list .v-list-item:hover {
  background: #26A69A; /* secondary */
}
</style>