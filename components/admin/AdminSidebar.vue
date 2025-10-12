<!-- components/admin/AdminSidebar.vue -->
<template>
  <ClientOnly>
    <v-navigation-drawer
      v-model="drawer"
      :permanent="isDesktop"
      :temporary="!isDesktop"
      rail
      expand-on-hover
      class="admin-drawer"
    >
      <template #prepend>
        <v-list density="compact" class="pa-0">
          <v-list-item :to="localePath('/admin')" :title="t('nav.dashboard')">
            <template #prepend>
              <v-icon>mdi-view-dashboard</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </template>

      <v-divider class="border-opacity-50" />

      <v-list density="compact" nav class="flex-grow-1">
        <v-list-item
          :to="localePath('/admin/audit')"
          prepend-icon="mdi-file-document-outline"
          :title="t('admin.menu.audit')"
        />
        <v-list-item
          :to="localePath('/admin/users')"
          prepend-icon="mdi-account-group-outline"
          :title="t('admin.menu.users')"
        />
        <v-list-item
          :to="localePath('/admin/wifi')"
          prepend-icon="mdi-wifi-marker"
          :title="t('admin.menu.wifi')"
        />
        <!-- moderation removed; use Admin Wi-Fi page for moderation tasks -->
      </v-list>
      <template #append>
        <v-divider class="border-opacity-50" />
        <v-list density="compact" nav>
          <v-list-item
            :to="localePath('/admin/settings')"
            prepend-icon="mdi-cog-outline"
            :title="t('admin.menu.settings') || 'Settings'"
          />
          <v-list-item
            :to="localePath('/')"
            prepend-icon="mdi-home"
            :title="t('admin.common.backHome')"
          />
        </v-list>
      </template>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDisplay } from "vuetify";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const drawer = ref(true);
const { mdAndUp } = useDisplay();
const isDesktop = computed(() => mdAndUp.value);
const localePath = useLocalePath();
</script>

<style scoped>
.admin-drawer {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-secondary)) 0%,
    rgb(var(--v-theme-primary)) 100%
  ) !important;
}

.admin-drawer :deep(.v-list-item) {
  color: white !important;
}

.admin-drawer :deep(.v-list-item__prepend .v-icon) {
  color: white !important;
}

.admin-drawer :deep(.v-list-item--active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.admin-drawer :deep(.v-list-item:hover) {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

.admin-drawer :deep(.v-divider) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}
</style>
