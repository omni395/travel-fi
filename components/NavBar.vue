<template>
  <v-app-bar
    app
    elevation="2"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
    }"
  >
    <v-menu v-if="isMobile">
      <template v-slot:activator="{ props }">
        <v-app-bar-nav-icon v-bind="props" />
      </template>

      <v-list
        :style="{
          background:
            'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
        }"
      >
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :to="item.to"
          class="text-white"
          @click=""
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-toolbar-title>
      <NuxtLink
        :to="localePath('/')"
        class="d-flex align-center text-white text-decoration-none"
      >
        <img
          src="~/assets/images/logo-1.png"
          alt="TravelFi Logo"
          class="mr-2"
          style="height: 32px; width: auto"
        />
        TravelFi
      </NuxtLink>
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-items v-if="!isMobile">
      <v-btn
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        variant="text"
        color="white"
      >
        {{ item.title }}
      </v-btn>
    </v-toolbar-items>

    <!-- Кнопки для неавторизованных пользователей -->
    <ClientOnly>
      <template v-if="!user">
        <!-- Desktop version -->
        <CustomButton
          v-if="!isMobile"
          :to="localePath('/auth/login')"
          color="accent"
          variant="elevated"
          class="ml-4"
        >
          {{ t("nav.login") }}
        </CustomButton>
        <CustomButton
          v-if="!isMobile"
          :to="localePath('/auth/signup')"
          color="accent"
          variant="elevated"
          class="ml-2"
        >
          {{ t("nav.signup") }}
        </CustomButton>

        <!-- Mobile version -->
        <v-btn
          v-if="isMobile"
          :to="localePath('/auth/login')"
          icon
          variant="text"
          color="accent"
          class="ml-2"
          :title="t('nav.login')"
        >
          <v-icon>mdi-login</v-icon>
        </v-btn>
        <v-btn
          v-if="isMobile"
          :to="localePath('/auth/signup')"
          icon
          variant="text"
          color="accent"
          class="ml-1"
          :title="t('nav.signup')"
        >
          <v-icon>mdi-account-plus</v-icon>
        </v-btn>
      </template>

      <!-- Меню пользователя для авторизованных -->
      <UserMenu v-if="user" />
    </ClientOnly>

    <v-menu :close-on-content-click="false" :min-width="60" max-width="100">
      <template v-slot:activator="{ props }">
        <v-btn
          color="white"
          v-bind="props"
          class="language-menu-btn ml-2 mr-4 px-2"
          data-test="language-menu-btn"
          size="small"
          variant="text"
          density="compact"
          height="32"
          min-width="auto"
          width="auto"
        >
          <span class="text-caption">{{
            currentLocale?.code?.toUpperCase() || currentLocaleName || "EN"
          }}</span>
          <v-icon size="small" class="ml-1" end>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list
        :style="{
          background:
            'linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)',
          minWidth: '60px',
          padding: '4px 0',
        }"
        class="py-0"
      >
        <v-list-item
          v-for="locale in availableLocales"
          :key="locale.code"
          :value="locale.code"
          @click="changeLocale(locale.code)"
          data-test="language-item"
        >
          <v-list-item-title
            class="text-center"
            style="font-size: 0.8rem; line-height: 1.2"
            >{{ locale.name }}</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useCookie, useLocalePath } from "#imports";
import { computed } from "vue";
import { useMediaQuery } from "@vueuse/core";
import CustomButton from "@/components/CustomButton.vue";
import UserMenu from "@/components/UserMenu.vue";
import { useUser } from "~/composables/useUser";

const { t, setLocale, locales, locale } = useI18n();
const isMobile = useMediaQuery("(max-width: 600px)");
const { user } = useUser();
const toast = useToast();

// Всегда использовать useLocalePath (SSR/SPA одинаково)
const localePath = useLocalePath();

// Проверка админских прав
const isAdmin = computed(() => {
  return user.value?.role === "admin" || user.value?.role === "moderator";
});

const navItems = computed(() => [
  { title: t("nav.wifi"), to: localePath("/wifi") },
  { title: t("nav.esim"), to: localePath("/esim") },
  { title: t("nav.about"), to: localePath("/about") },
]);

// Add currentLocale computed property
const currentLocale = computed(() => {
  return (
    availableLocales.value.find((l) => l.code === locale.value) || {
      code: "en",
      name: "EN",
    }
  );
});

const availableLocales = computed(() => {
  const locs =
    locales.value && Array.isArray(locales.value)
      ? locales.value
      : [
          { code: "en", name: "EN" },
          { code: "ru", name: "РУ" },
          { code: "es", name: "ES" },
          { code: "zh", name: "中文" },
        ];
  return locs;
});

const currentLocaleName = computed(() => {
  const current = availableLocales.value.find((l) => l.code === locale.value);
  const name = current ? current.name : "Select Language";
  return name;
});

const changeLocale = async (localeCode) => {
  try {
    await setLocale(localeCode);
    useCookie("i18n_redirected").value = localeCode;
  } catch (error) {}
};

// Обработка выхода из мобильного меню
const handleMobileLogout = async () => {
  drawer.value = false;
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
.text-white {
  color: white !important;
}
.language-menu-btn {
  text-transform: none;
  min-width: 120px;
  z-index: 1000;
  min-height: 40px !important;
  height: 40px !important;
}

.logout-item:hover {
  background-color: rgba(var(--v-theme-error), 0.08) !important;
  color: rgb(var(--v-theme-error)) !important;
}

.logout-item:hover .v-icon {
  color: rgb(var(--v-theme-error)) !important;
}
</style>
