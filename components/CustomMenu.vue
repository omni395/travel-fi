<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <slot name="activator" v-bind="props" />
    </template>
    <slot />
  </v-menu>
</template>

<script setup>
// Простая обертка для v-menu без дополнительной логики
</script>

<style scoped>
/* Стили убраны, за отображение отвечает родительский компонент */
</style>
