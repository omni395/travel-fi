<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col v-if="!isAuthenticated" cols="12">
        <v-alert type="error">
          Вы не авторизованы. Пожалуйста, <NuxtLink to="/auth/login">войдите</NuxtLink>.
        </v-alert>
      </v-col>
      <v-col v-else-if="!isAdmin" cols="12">
        <v-alert type="warning">
          У вас нет доступа к админ-панели. Обратитесь к администратору.
        </v-alert>
      </v-col>
      <v-col v-else cols="12" md="8">
        <v-card class="pa-4 elevation-2">
          <v-card-title class="text-h4 font-weight-bold primary--text">
            Admin Panel
          </v-card-title>
          <v-card-text>
            <p>Добро пожаловать в админ-панель TravelFi. Здесь вы можете управлять пользователями и сервизами.</p>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Текущий пользователь: {{ user?.name || 'N/A' }} (Admin)</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Email: {{ user?.email || 'N/A' }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="handleLogout">Выйти</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="$router.push('/')">На главную</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useUserSession } from '~/composables/useUserSession'

const { user } = useUserSession()
const isAuthenticated = computed(() => !!user.value)
const isAdmin = inject('isAdmin')
const logout = inject('logout')

watch(isAuthenticated, (auth) => {
  if (!auth) {
    navigateTo('/auth/login')
  }
})

watch(isAdmin, (admin) => {
  if (!admin) {
    navigateTo('/profile')
  }
})

const handleLogout = () => {
  if (logout) {
    logout()
  }
}
</script>

<style scoped>
</style>