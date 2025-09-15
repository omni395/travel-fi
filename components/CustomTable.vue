<template>
  <v-data-table
    :items="items"
    :headers="headers"
    :items-per-page="itemsPerPage"
    class="travel-table"
    v-bind="$attrs"
  >
    <slot />
  </v-data-table>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  items: { type: Array, default: () => [] },
  headers: { type: Array, default: () => [] }, // [{ title, key }]
  itemsPerPage: { type: Number, default: 10 }
})
</script>
<style scoped>
.travel-table {
  border: 1px solid #0288D1; /* primary */
}
</style>