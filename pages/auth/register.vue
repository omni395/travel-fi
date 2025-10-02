<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h5 text-center">{{ t('auth.registerTitle') }}</v-card-title>
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
              <v-text-field
                v-model="formData.confirmPassword"
                :label="t('auth.confirmPassword')"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="[v => !!v || t('auth.required'), v => v === formData.value.password || t('auth.passwordsMismatch')]"
                required
              />
              <v-checkbox
                v-model="formData.agreeTerms"
                :label="t('auth.agreeTerms')"
                :rules="[v => !!v || t('auth.required')]"
                required
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
              >
                {{ t('auth.registerBtn') }}
              </v-btn>
            </v-form>
          </v-card-text>
          <v-divider class="my-4" />
          <v-btn to="/auth/login" color="accent" block variant="text">
            {{ t('auth.loginLink') }}
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
// @ts-ignore
import { ref } from 'vue'
import { useRouter } from '#app'
import { useUser } from '~/composables/useUser'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const { register } = useUser()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const form = ref()
const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const onSubmit = async () => {
  const { valid } = await form.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await register(formData.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.data?.message || t('auth.errorRegister')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
