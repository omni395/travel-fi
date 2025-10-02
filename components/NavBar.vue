<template>
  <v-app-bar color="primary" elevation="2" fixed>
    <v-app-bar-nav-icon @click="drawer = !drawer" />

    <v-btn to="/" variant="text" color="transparent" class="logo-link">
      <v-toolbar-title class="logo-section">
        <v-img
          src="/assets/images/logo-1.png"
          alt="TravelFi Logo"
          max-height="32"
          max-width="32"
          class="logo-image"
        />
        <span class="logo-text">TravelFi</span>
      </v-toolbar-title>
    </v-btn>

    <v-spacer />

    <v-btn v-if="isAuthenticated" @click="handleLogout" color="error" variant="text">
      {{ t('nav.logout') }}
    </v-btn>

    <v-btn v-else @click="handleLogin" color="accent" variant="text">
      {{ t('nav.login') }}
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="left" v-if="isMobile" @click:outside="drawer = false">
    <v-list>
      <v-list-item to="/wifi" @click="drawer = false">
        <v-list-item-title>{{ t('nav.wifi') }}</v-list-item-title>
      </v-list-item>
      <v-list-item to="/esim" @click="drawer = false">
        <v-list-item-title>{{ t('nav.esim') }}</v-list-item-title>
      </v-list-item>
      <v-list-item to="/about" @click="drawer = false">
        <v-list-item-title>{{ t('nav.about') }}</v-list-item-title>
      </v-list-item>

      <v-list-item v-if="isAuthenticated" to="/dashboard" @click="drawer = false">
        <v-list-item-title>{{ t('nav.dashboard') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="isAuthenticated" to="/profile" @click="drawer = false">
        <v-list-item-title>{{ t('nav.profile') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="isAuthenticated && isAdmin" to="/admin" @click="drawer = false">
        <v-list-item-title>{{ t('nav.admin') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="isAuthenticated" @click="handleLogout; drawer = false">
        <v-list-item-title>{{ t('nav.logout') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="!isAuthenticated" to="/auth/login" @click="drawer = false">
        <v-list-item-title>{{ t('nav.login') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="!isAuthenticated" to="/auth/signup" @click="drawer = false">
        <v-list-item-title>{{ t('nav.signup') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { useUser } from '~/composables/useUser'
import { useI18n } from 'vue-i18n'
import { useMediaQuery } from '@vueuse/core'

const router = useRouter()
const drawer = ref(false)
const { t } = useI18n()
const { isAuthenticated, isAdmin, logout } = useUser()
const isMobile = useMediaQuery('(max-width: 600px)')

const handleLogout = async () => {
  console.log('Logout button clicked - test!')
  await logout()
}

const handleLogin = () => {
  router.push('/auth/login')
}
</script>

<style scoped>
.text-white {
  color: white !important;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-link {
  text-decoration: none !important;
  min-width: auto;
  padding: 0 !important;
}

.logo-link:hover .logo-section {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.logo-image {
  border-radius: 4px;
  background-color: #fff;
  transition: transform 0.3s ease;
}

.logo-fallback {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.logo-text {
  font-weight: bold;
  font-size: 1.25rem;
}

.language-menu-btn {
  text-transform: none;
  min-width: 120px;
  z-index: 1000;
}

.mobile-language-btn {
  min-width: auto;
  padding: 8px;
}

.user-menu-btn {
  text-transform: none;
  min-width: auto;
}

.v-btn {
  z-index: 1000 !important;
}
</style>
