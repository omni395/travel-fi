<!-- layouts/admin.vue -->
<template>
  <v-app>
    <NavBar />
    <AdminSidebar />
    <v-main>
      <slot />
      <PWAInstall />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import PWAInstall from "@/components/PWAInstall.vue";
import AdminSidebar from "~/components/admin/AdminSidebar.vue";
</script>
