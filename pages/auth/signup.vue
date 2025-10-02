<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <CustomCard>
          <v-card-title class="text-h5 text-center">{{ t('auth.registerTitle') }}</v-card-title>
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
                :rules="[ (v) => !!v || t('auth.required'), (v) => /.+@.+\..+/.test(v) || t('auth.emailInvalid') ]"
                required
              />
              <v-text-field
                :model-value="password"
                @update:model-value="val => password = val"
                :type="showPassword ? 'text' : 'password'"
                :label="t('auth.password')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                color="primary"
                class="mb-4"
                :rules="[ (v) => !!v || t('auth.required'), (v) => v.length >= 8 || t('auth.passwordMin') ]"
                required
              />
              <v-text-field
                :model-value="password2"
                @update:model-value="val => password2 = val"
                :type="showPassword2 ? 'text' : 'password'"
                :label="t('auth.passwordRepeat')"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showPassword2 ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword2 = !showPassword2"
                variant="outlined"
                color="primary"
                class="mb-6"
                :rules="[ (v) => !!v || t('auth.required'), (v) => v === password || t('auth.passwordsMismatch') ]"
                required
              />
              <CustomButton type="submit" color="primary" :loading="isLoading" block>
                {{ t('auth.registerBtn') }}
              </CustomButton>
            </v-form>
            <v-divider class="my-6" />
            <div class="text-center">
              {{ t('auth.haveAccount') }}
              <NuxtLink :to="localePath('/auth/login')" class="ml-2 text-primary">{{ t('auth.loginLink') }}</NuxtLink>
            </div>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>
    <v-overlay
      :model-value="isLoading"
      @update:model-value="val => isLoading = val"
      scrim
      color="#0288D1"
      :opacity="0.1"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#i18n'
import { useRouter, useNuxtApp } from '#app'
import { useUser } from '~/composables/useUser'

interface Toast {
  success: (msg: string) => void
  error: (msg: string) => void
}

const email = ref('')
const password = ref('')
const password2 = ref('')
const showPassword = ref(false)
const showPassword2 = ref(false)
const isLoading = ref(false)

const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast as Toast | undefined
const { fetchUser } = useUser()

async function onSubmit() {
  if (!email.value || !password.value || !password2.value || password.value !== password2.value) {
    $toast?.error(t('auth.requiredFields') || t('auth.passwordsMismatch'))
    return
  }
  if (password.value.length < 8) {
    $toast?.error(t('auth.passwordMin'))
    return
  }
  isLoading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email: email.value, password: password.value },
      headers: {
        'X-CSRF-Token': nuxtApp.$csrfToken.value || ''
      }
    })
    await fetchUser()
    $toast?.success(t('auth.successRegister'))
    await router.push('/dashboard')
  } catch (e: any) {
    $toast?.error(e.data?.message || t('auth.errorRegister'))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>


