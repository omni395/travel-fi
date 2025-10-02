<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <CustomCard>
          <v-card-title class="text-h5 text-center">{{ t('auth.forgotTitle') }}</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" :disabled="isLoading">
              <v-text-field
                :model-value="email"
                @update:model-value="val => email = val"
                type="email"
                :label="t('auth.email')"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="primary"
                class="mb-4"
                :rules="[ (v: string) => !!v || t('auth.required'), (v: string) => /.+@.+\..+/.test(v) || t('auth.emailInvalid') ]"
                required
              />
              <CustomButton type="submit" color="primary" :loading="isLoading" block size="large">
                {{ t('auth.forgotBtn') }}
              </CustomButton>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center pa-4">
            <NuxtLink :to="localePath('/auth/login')" class="text-primary text-decoration-none">
              {{ t('auth.backToLogin') }}
            </NuxtLink>
          </v-card-actions>
        </CustomCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#i18n'
import { useNuxtApp } from '#app'

const email = ref('')
const isLoading = ref(false)

const { t } = useI18n()
const localePath = useLocalePath()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast as any

async function onSubmit() {
  if (!email.value) {
    $toast?.error(t('auth.required'))
    return
  }
  isLoading.value = true
  try {
    await $fetch('/api/auth/forgot', {
      method: 'POST',
      body: { email: email.value },
      headers: {
        'X-CSRF-Token': nuxtApp.$csrfToken.value || ''
      }
    })
    $toast?.success(t('auth.forgotSent'))
  } catch (e: any) {
    $toast?.error(e.data?.message || t('auth.errorForgot'))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>


