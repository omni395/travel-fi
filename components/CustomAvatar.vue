<template>
  <v-avatar class="travel-avatar" :size="size" v-bind="$attrs">
    <img 
      v-if="image" 
      :src="displaySrc" 
      alt="Avatar" 
      @error="handleError" 
      style="width: 100%; height: 100%; object-fit: cover;"
    />
    <v-icon v-else color="white">mdi-account</v-icon>
  </v-avatar>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  image: { type: String, default: '' },
  initial: { type: String, default: '' },
  size: { type: [Number, String], default: 48 }
})

const displaySrc = ref(props.image)

const handleError = () => {
  displaySrc.value = '/assets/images/no-image.png'
}
</script>

<style scoped>
.travel-avatar {
  background-color: rgb(var(--v-theme-primary));
  border: 2px solid rgb(var(--v-theme-secondary));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.travel-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(2, 136, 209, 0.3);
}
</style>