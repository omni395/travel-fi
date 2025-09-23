<template>
  <v-avatar class="travel-avatar" :image="image" :size="size" v-bind="$attrs">
    <span v-if="!image" class="white--text">{{ initial }}</span>
  </v-avatar>
</template>
<script setup>
defineProps({
  image: { type: String, default: '' }, // User.profilePic
  initial: { type: String, default: '' }, // Первая буква email
  size: { type: [Number, String], default: 48 }
})
</script>
<style scoped>
.travel-avatar {
  background-color: rgb(var(--v-theme-primary));
  border: 2px solid rgb(var(--v-theme-accent));
  transition: transform 0.3s ease;
}
.travel-avatar:hover {
  transform: rotate(10deg);
}
</style>