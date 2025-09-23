<template>
  <v-dialog
    :color="color"
    class="travel-dialog"
    v-bind="$attrs"
  >
    <slot />
  </v-dialog>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'primary' } // primary (#0288D1)
})
</script>
<style scoped>
.travel-dialog .v-dialog-content {
  background: #FFFFFF; /* white for readability */
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  transition: transform 0.3s ease;
}
.travel-dialog .v-card-actions {
  background: rgb(var(--v-theme-primary));
}
.travel-dialog .v-btn {
  color: #FFFFFF;
}
</style>