<template>
  <v-navigation-drawer
    :color="color"
    class="travel-drawer"
    v-bind="$attrs"
  >
    <slot />
  </v-navigation-drawer>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'secondary' } // secondary (#26A69A)
})
</script>
<style scoped>
.travel-drawer {
  background: rgb(var(--v-theme-secondary));
  color: #FFFFFF;
  transition: width 0.3s ease;
}
.travel-drawer .v-list-item {
  color: rgb(var(--v-theme-primary));
}
.travel-drawer .v-list-item:hover {
  background: rgb(var(--v-theme-accent));
}
</style>