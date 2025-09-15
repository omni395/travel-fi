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
    <CustomMenu color="primary">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" color="white">
          {{ currentLocale.name }}
          <v-icon right>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="switchLocale(locale.code)"
        >
          {{ locale.name }}
        </v-list-item>
      </v-list>
    </CustomMenu>
    <CustomButton :to="'/login'" color="accent" variant="elevated" class="ml-4">
      {{ t('nav.login') }}
    </CustomButton>
    <CustomButton :to="'/signup'" color="accent" variant="elevated" class="ml-2">
      {{ t('nav.signup') }}
    </CustomButton>

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
import CustomButton from '@/components/CustomButton.vue';
import CustomMenu from '@/components/CustomMenu.vue';

const { t, locale, availableLocales } = useI18n();
const route = useRoute();
const isMobile = useMediaQuery('(max-width: 600px)');
const drawer = ref(false);

// Mock admin status (replace with real auth logic)
const isAdmin = ref(false);

// Navigation items
const navItems = [
  { title: t('nav.wifi'), to: '/wifi' },
  { title: t('nav.esim'), to: '/esim' },
  { title: t('nav.about'), to: '/about' },
];

// Current locale name
const currentLocale = computed(() => availableLocales.find(l => l.code === locale.value) || { name: 'English', code: 'en' });

// Switch locale
const switchLocale = (code) => {
  locale.value = code;
};
</script>

<style scoped>
.text-white {
  color: white !important;
}
</style>
