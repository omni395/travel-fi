<template>
  <v-menu
    v-bind="$attrs"
  >
    <template v-slot:activator="{ props }">
      <slot name="activator" v-bind="{ ...props }" />
    </template>
    <slot />
  </v-menu>
</template>

<script setup>
defineProps({
  // Этот пропс больше не используется, но можно оставить на всякий случай
  color: { type: String, default: 'primary' }
})
</script>

<style scoped>
/* Убрали стили, которые ломали отображение, так как
   теперь за это отвечает родительский компонент.
*/
</style>
