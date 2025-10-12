<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="white"
        variant="text"
        class="user-menu-btn ml-4 d-flex align-center"
      >
        <CustomAvatar
          :image="user?.profilePicture"
          :initial="(user?.name || 'U')?.charAt(0) || 'U'"
          size="28"
          class="mr-1"
        />
        <v-icon size="small">mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <v-list class="user-menu-list" min-width="200" :style="{ background: 'linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)' }">
      <!-- Профиль -->
      <v-list-item :to="localePath('/profile')" class="menu-item" color="white">
        <template #prepend>
          <v-icon>mdi-account</v-icon>
        </template>
        <v-list-item-title>{{ t("nav.profile") }}</v-list-item-title>
      </v-list-item>

      <!-- Дашборд -->
      <v-list-item :to="localePath('/dashboard')" class="menu-item" color="white">
        <template #prepend>
          <v-icon>mdi-view-dashboard</v-icon>
        </template>
        <v-list-item-title>{{ t("nav.dashboard") }}</v-list-item-title>
      </v-list-item>

      <!-- Админ панель (если админ) -->
      <v-list-item v-if="isAdmin" :to="localePath('/admin')" class="menu-item" color="white">
        <template #prepend>
          <v-icon>mdi-shield-crown</v-icon>
        </template>
        <v-list-item-title>{{ t("nav.admin") }}</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2" />

      <!-- Выход -->
      <v-list-item @click="handleLogout" class="menu-item logout-item" color="white">
        <template #prepend>
          <v-icon>mdi-logout</v-icon>
        </template>
        <v-list-item-title>{{ t("nav.logout") }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "~/composables/useUser";
import CustomAvatar from "./CustomAvatar.vue";

const { t } = useI18n();
const localePath = useLocalePath();
const { user, clear } = useUser();
const toast = useToast();

// Отображаемое имя пользователя (не используется, но оставляем на случай если понадобится)
const displayName = computed(() => {
  if (!user.value) return t("nav.guest");
  return user.value.name || t("nav.user");
});

// Проверка админских прав
const isAdmin = computed(() => {
  return user.value?.role === "admin" || user.value?.role === "moderator";
});

// Обработка выхода из системы
const handleLogout = async () => {
  try {
    await clear();

    toast.success({
      title: t("auth.loggedOut"),
      message: t("auth.logoutSuccess"),
      position: "topRight",
      timeout: 3000,
    });

    // Перенаправляем на главную страницу
    await navigateTo(localePath("/"));
  } catch (error) {
    console.error("Logout error:", error);
    toast.error({
      title: t("auth.errorLogout"),
      message: t("auth.logoutFailed"),
      position: "topRight",
      timeout: 3000,
    });
  }
};
</script>

<style scoped>
.user-menu-btn {
  text-transform: none !important;
  font-weight: normal !important;
  padding: 6px 8px !important;
  min-width: auto !important;
  min-height: 40px !important;
  height: 40px !important;
}

.user-menu-list {
  background-color: rgb(var(--v-theme-surface)) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px !important;
}

.menu-item {
  padding: 12px 16px !important;
  transition: all 0.2s ease !important;
}

.menu-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.logout-item:hover {
  background-color: rgba(var(--v-theme-error), 0.08) !important;
  color: rgb(var(--v-theme-error)) !important;
}

.logout-item:hover .v-icon {
  color: rgb(var(--v-theme-error)) !important;
}
</style>