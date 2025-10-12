<template>
  <v-btn
    v-if="showInstallButton"
    @click="installPWA"
    color="primary"
    variant="elevated"
    class="install-button"
    prepend-icon="mdi-download"
  >
    {{ t("install_app") }}
  </v-btn>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const showInstallButton = ref(false);
let deferredPrompt: any = null;

onMounted(() => {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton.value = true;
  });
});

const installPWA = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") {
    showInstallButton.value = false;
  }
  deferredPrompt = null;
};
</script>

<style scoped>
.install-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
