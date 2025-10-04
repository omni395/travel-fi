<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h5 text-center">{{ t('auth.loginTitle') }}</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" ref="form">
              <v-text-field
                v-model="formData.email"
                :label="t('auth.email')"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                :rules="[v => !!v || t('auth.required'), v => /.+@.+\..+/.test(v as string) || t('auth.emailInvalid')]"
                required
              />
              <v-text-field
                v-model="formData.password"
                :label="t('auth.password')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="[v => !!v || t('auth.required'), v => (v as string).length >= 8 || t('auth.passwordMin')]"
                required
              />
              <v-checkbox
                v-model="formData.rememberMe"
                :label="t('auth.rememberMe')"
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
              >
                {{ t('auth.loginBtn') }}
              </v-btn>
            </v-form>
          </v-card-text>
          <v-divider class="my-4" />
          <v-btn to="/auth/signup" color="accent" block variant="text">
            {{ t('auth.signupLink') }}
          </v-btn>
          <v-alert v-if="error" type="error" class="mt-4">
            {{ error }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<<<<<<< HEAD
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { useUser } from '~/composables/useUser'
=======
<script setup>
import { ref, onMounted } from 'vue'
>>>>>>> authentication
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

<<<<<<< HEAD
const router = useRouter()
const { t } = useI18n()
const { login } = useUser()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const form = ref()
const formData = ref({
  email: '',
  password: '',
  rememberMe: false
=======
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const csrfToken = ref('')

const router = useRouter()
const { t } = useI18n()
const toast = useToast()  // Из nuxt-toast, auto-imported

onMounted(async () => {
  try {
    const { csrf } = await $fetch('/api/csrf')
    csrfToken.value = csrf
  } catch (e) {
    console.error('CSRF fetch error:', e)
  }
>>>>>>> authentication
})

const onSubmit = async () => {
  const { valid } = await form.value?.validate()
  if (!valid) return

  loading.value = true
  try {
<<<<<<< HEAD
    await login(formData.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.data?.message || t('auth.errorLogin')
  } finally {
    loading.value = false
=======
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value, _csrf: csrfToken.value }
    })
    toast.success({
      title: t('auth.successLogin'),
      message: t('auth.welcome'),
      position: 'topRight',
      timeout: 3000
    })
    await router.push('/dashboard')
  } catch (e) {
    toast.error({
      title: t('auth.errorLogin'),
      message: t('auth.loginFailed'),
      position: 'topRight',
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}

async function loginWithGoogle() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('error')) {
      toast.error(t('auth.errorOAuth'))
      return
    }
    window.location.href = '/api/auth/google'
  } catch (e) {
    toast.error(t('auth.errorOAuth'))
  }
}

async function loginWithMetamask() {
  try {
    if (!window.ethereum) {
      toast.error({
        title: t('auth.metamaskMissing'),
        message: t('auth.metamaskMissing'),
        position: 'topRight',
        timeout: 3000
      })
      return
    }
    isLoading.value = true
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const { nonce } = await $fetch('/api/auth/siwe/nonce')
    const message = `Sign-in with Ethereum to TravelFi.\n\nAddress: ${account}\nNonce: ${nonce}`
    const signature = await window.ethereum.request({ method: 'personal_sign', params: [message, account] })
    await $fetch('/api/auth/siwe/verify', { method: 'POST', body: { message, signature, _csrf: csrfToken.value } })
    toast.success({
      title: t('auth.walletConnected'),
      message: t('auth.walletConnected'),
      position: 'topRight',
      timeout: 3000
    })
    const { user: sessionUser } = await $fetch('/api/auth/session')
    // если есть useUser, можно user.value = sessionUser
    await router.push('/dashboard')
  } catch (e) {
    toast.error({
      title: t('auth.errorSIWE'),
      message: t('auth.errorSIWE'),
      position: 'topRight',
      timeout: 3000
    })
  } finally {
    isLoading.value = false
>>>>>>> authentication
  }
}
</script>

<style scoped>
/* Empty, styles from main.css */
</style>


