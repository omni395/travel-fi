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

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { useUser } from '~/composables/useUser'
import { useI18n } from 'vue-i18n'

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
})

const onSubmit = async () => {
  const { valid } = await form.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await login(formData.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.data?.message || t('auth.errorLogin')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Empty, styles from main.css */
</style>


