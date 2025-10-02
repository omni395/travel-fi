<template>
  <v-container fluid class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <CustomCard>
          <v-card-title class="text-h4 text-center primary--text mb-6">
            {{ t('wifi.addTitle') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" ref="form">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="form.ssid"
                    @update:model-value="val => form.ssid = val"
                    :label="t('wifi.ssid')"
                    prepend-inner-icon="mdi-wifi"
                    variant="outlined"
                    color="primary"
                    :rules="[ (v) => !!v || t('wifi.required') ]"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="form.password"
                    @update:model-value="val => form.password = val"
                    :label="t('wifi.password')"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    color="primary"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    :model-value="form.description"
                    @update:model-value="val => form.description = val"
                    :label="t('wifi.description')"
                    prepend-inner-icon="mdi-map-marker"
                    variant="outlined"
                    color="primary"
                    rows="3"
                    :rules="[ (v) => !!v || t('wifi.required') ]"
                  />
                </v-col>
                <v-col cols="12">
                  <CustomMap
                    :model-value="form.location"
                    @update:model-value="val => form.location = val"
                    :label="t('wifi.location')"
                    height="400px"
                  />
                </v-col>
              </v-row>
              <v-row justify="center" class="mt-6">
                <CustomButton type="submit" color="primary" :loading="isLoading" size="large" block>
                  {{ t('wifi.addBtn') }}
                </CustomButton>
              </v-row>
            </v-form>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>
    <v-overlay
      :model-value="isLoading"
      @update:model-value="val => isLoading = val"
      contained
      persistent
      color="primary"
      opacity="0.1"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useNuxtApp } from '#app'
import type { LatLngExpression } from 'leaflet'

interface WifiForm {
  ssid: string
  password?: string
  description: string
  location: LatLngExpression
}

const form = ref<WifiForm>({
  ssid: '',
  description: '',
  location: [0, 0] as LatLngExpression
})
const showPassword = ref(false)
const isLoading = ref(false)
const formRef = ref()

const { t } = useI18n()
const router = useRouter()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast

async function onSubmit() {
  if (!formRef.value?.validate()) return

  isLoading.value = true
  try {
    await $fetch('/api/wifi', {
      method: 'POST',
      body: form.value,
      headers: {
        'X-CSRF-Token': nuxtApp.$csrfToken.value || ''
      }
    })
    $toast?.success(t('wifi.successAdd'))
    router.push('/dashboard')
  } catch (error: any) {
    $toast?.error(error.data?.message || t('wifi.errorAdd'))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>