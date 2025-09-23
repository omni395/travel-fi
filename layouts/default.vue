<template>
  <v-layout>
    <NavBar />
    <v-main>
      <slot />
    </v-main>
    <Footer />
  </v-layout>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
</script>

<style scoped>
</style>
