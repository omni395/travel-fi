<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <CustomCard>
          <v-card-title class="text-h5 text-center">{{ t('auth.registerTitle') }}</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" :disabled="isLoading">
              <v-text-field
                v-model="email"
                type="email"
                :label="t('auth.email')"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="primary"
                class="mb-4"
                required
              />
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :label="t('auth.password')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                color="primary"
                class="mb-4"
                required
              />
              <v-text-field
                v-model="password2"
                :type="showPassword ? 'text' : 'password'"
                :label="t('auth.passwordRepeat')"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                color="primary"
                class="mb-6"
                required
              />
              <CustomButton type="submit" color="primary" :loading="isLoading" block>
                {{ t('auth.registerBtn') }}
              </CustomButton>
            </v-form>
            <v-divider class="my-6" />
            <div class="text-center">
              {{ t('auth.haveAccount') }}
              <NuxtLink :to="$localePath('/auth/login')" class="ml-2 text-white">{{ t('auth.loginLink') }}</NuxtLink>
            </div>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>
  </v-container>
  <v-overlay v-model="isLoading" scrim color="#0288D1" :opacity="0.1" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const password2 = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const csrfToken = ref('')

const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast() // Из nuxt-toast, auto-imported

onMounted(async () => {
  try {
    const { csrf } = await $fetch('/api/csrf')
    csrfToken.value = csrf
  } catch (e) {
    console.error('CSRF fetch error:', e)
  }
})

async function onSubmit() {
  if (!email.value || !password.value || password.value !== password2.value) {
    toast.error({
      title: t('auth.passwordsMismatch'),
      message: t('auth.passwordsMismatch'),
      position: 'topRight',
      timeout: 3000
    })
    return
  }
  isLoading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email: email.value, password: password.value, _csrf: csrfToken.value }
    })
    toast.success({
      title: t('auth.successRegister'),
      message: t('auth.accountCreated'),
      position: 'topRight',
      timeout: 3000
    })
    await router.push(localePath('/dashboard'))
  } catch (e) {
    toast.error({
      title: t('auth.errorRegister'),
      message: t('auth.registrationFailed'),
      position: 'topRight',
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>
