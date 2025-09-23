<template>
  <v-app-bar color="primary" elevation="2" fixed>
    <v-app-bar-nav-icon v-if="isMobile" @click="drawer = !drawer" />
    <v-toolbar-title>
      <NuxtLink to="/" class="text-white">TravelFi</NuxtLink>
    </v-toolbar-title>
    <v-spacer />
    <v-toolbar-items v-if="!isMobile">
      <v-btn v-for="item in navItems" :key="item.title" :to="item.to" variant="text" color="white">
        {{ item.title }}
      </v-btn>
      <v-btn v-if="isAdmin" to="/admin" variant="text" color="white">
        {{ t('nav.admin') }}
      </v-btn>
    </v-toolbar-items>
    <CustomButton :to="'/auth/login'" color="accent" variant="elevated" class="ml-4">
      {{ t('nav.login') }}
    </CustomButton>
    <CustomButton :to="'/auth/signup'" color="accent" variant="elevated" class="ml-2">
      {{ t('nav.signup') }}
    </CustomButton>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          color="white"
          v-bind="props"
          class="language-menu-btn"
          data-test="language-menu-btn"
        >
          {{ currentLocaleName || 'Select Language' }}
          <v-icon end>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list bg-color="secondary">
        <v-list-item
          v-for="locale in availableLocales"
          :key="locale.code"
          :value="locale.code"
          @click="changeLocale(locale.code)"
          data-test="language-item"
        >
          <v-list-item-title color="white">{{ locale.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-navigation-drawer v-model="drawer" temporary rail-width="56" v-if="isMobile">
      <v-list>
        <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" @click="drawer = false">
          {{ item.title }}
        </v-list-item>
        <v-list-item v-if="isAdmin" to="/admin" @click="drawer = false">
          {{ t('nav.admin') }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useCookie, useRoute } from '#app';
import { computed, ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import CustomButton from '@/components/CustomButton.vue';

const { t, setLocale, locales, locale } = useI18n();
const route = useRoute();
const isMobile = useMediaQuery('(max-width: 600px)');
const drawer = ref(false);

const isAdmin = ref(false);

const navItems = [
  { title: t('nav.wifi'), to: '/wifi' },
  { title: t('nav.esim'), to: '/esim' },
  { title: t('nav.about'), to: '/about' },
];

const availableLocales = computed(() => {
  const locs = locales.value && Array.isArray(locales.value) ? locales.value : [
    { code: 'en', name: 'Eng' },
    { code: 'ru', name: 'Рус' },
    { code: 'es', name: 'Esp' },
    { code: 'zh', name: '中文' },
  ];
  return locs;
});

const currentLocaleName = computed(() => {
  const current = availableLocales.value.find(l => l.code === locale.value);
  const name = current ? current.name : 'Select Language';
  return name;
});

const changeLocale = async (localeCode) => {
  try {
    await setLocale(localeCode);
    useCookie('i18n_redirected').value = localeCode;
  } catch (error) {
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
}
</style>
