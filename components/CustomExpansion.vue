<template>
  <v-expansion-panels
    :color="color"
    class="travel-expansion"
    v-bind="$attrs"
  >
    <slot />
  </v-expansion-panels>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'primary' } // primary (#0288D1)
})
</script>
<style scoped>
.travel-expansion .v-expansion-panel-title {
  background: rgb(var(--v-theme-primary));
  color: #FFFFFF;
}
.travel-expansion .v-expansion-panel-content {
  background: #FFFFFF;
}
</style>