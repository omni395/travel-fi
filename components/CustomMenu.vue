<template>
  <v-menu
    :color="color"
    class="travel-menu"
    v-bind="$attrs"
  >
    <slot />
  </v-menu>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'primary' } // primary (#0288D1)
})
</script>
<style scoped>
.travel-menu .v-menu-content {
  background: #0288D1; /* primary */
  color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: opacity 0.3s ease;
}
.travel-menu .v-list-item:hover {
  background: #26A69A; /* secondary */
}
</style>