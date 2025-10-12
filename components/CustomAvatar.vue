<template>
  <v-avatar class="travel-avatar" :size="size" v-bind="$attrs">
    <img
      v-if="image && !imageError"
      :src="image"
      alt="Avatar"
      @error="handleError"
      style="width: 100%; height: 100%; object-fit: cover"
    />
    <span v-else-if="initial" class="text-h6 font-weight-bold text-white">
      {{ initial.toUpperCase() }}
    </span>
    <v-icon v-else color="white" size="large">mdi-account</v-icon>
  </v-avatar>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  image: { type: String, default: "" },
  initial: { type: String, default: "" },
  size: { type: [Number, String], default: 48 },
});

const imageError = ref(false);

const handleError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.travel-avatar {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-secondary)) 0%,
    rgb(var(--v-theme-primary)) 100%
  );
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.travel-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(2, 136, 209, 0.4);
}
</style>
