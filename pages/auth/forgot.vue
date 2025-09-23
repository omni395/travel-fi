<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <CustomCard>
          <v-card-title class="text-h5 text-center">{{ t('auth.forgotTitle') }}</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" :disabled="isLoading">
              <v-text-field
                v-model="email"
                type="email"
                :label="t('auth.email')"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="primary"
                class="mb-6"
                required
              />
              <CustomButton type="submit" color="primary" :loading="isLoading" block>
                {{ t('auth.forgotBtn') }}
              </CustomButton>
            </v-form>
            <v-divider class="my-6" />
            <div class="text-center">
              <NuxtLink to="/auth/login" class="text-white">{{ t('auth.backToLogin') }}</NuxtLink>
            </div>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>
  </v-container>
  <v-overlay v-model="isLoading" scrim color="#0288D1" :opacity="0.1" />
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const email = ref('')
const isLoading = ref(false)

const { t } = useI18n()
const { $toast } = useNuxtApp()

async function onSubmit() {
  if (!email.value) return
  isLoading.value = true
  try {
    await $fetch('/api/auth/forgot', { method: 'POST', body: { email: email.value } })
    $toast?.success(t('auth.forgotSent'))
  } catch (e) {
    $toast?.error(t('auth.errorForgot'))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>


