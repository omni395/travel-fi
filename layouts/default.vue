<template>
  <v-layout class="d-flex flex-column" style="min-height: 100vh">
    <v-overlay
      v-model="isLoading"
      class="align-center justify-center"
      :scrim="true"
      scrim-color="#0288D1"
      opacity="0.8"
    >
      <v-img
        src="/assets/images/logo-1.png"
        alt="TravelFi Logo"
        max-width="200"
        max-height="200"
        class="mx-auto"
      />
    </v-overlay>
    <NavBar />
    <v-main>
      <slot />
      <PWAInstall />
    </v-main>

    <Footer />
  </v-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";
import PWAInstall from "@/components/PWAInstall.vue";

// The splash screen is shown until the page is fully loaded
const isLoading = ref(true);

onMounted(() => {
  // Hide the splash screen after the component is mounted
  isLoading.value = false;
});
</script>

<style scoped>
.v-overlay {
  z-index: 1000;
}
</style>
