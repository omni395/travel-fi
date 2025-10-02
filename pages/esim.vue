<template>
  <v-container fluid class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <CustomCard>
          <v-card-title class="text-h4 text-center primary--text mb-6">
            {{ t('esim.addTitle') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" ref="form">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="form.provider"
                    @update:model-value="val => form.provider = val"
                    :label="t('esim.provider')"
                    prepend-inner-icon="mdi-cellphone"
                    variant="outlined"
                    color="primary"
                    :rules="[ (v) => !!v || t('esim.required') ]"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="dataStr"
                    @update:model-value="val => form.data = parseFloat(val) || 0"
                    type="number"
                    :label="t('esim.dataGb')"
                    prepend-inner-icon="mdi-database"
                    variant="outlined"
                    color="primary"
                    :rules="[ (v) => form.data > 0 || t('esim.required') ]"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="priceStr"
                    @update:model-value="val => form.price = parseFloat(val) || 0"
                    type="number"
                    :label="t('esim.price')"
                    prepend-inner-icon="mdi-currency-usd"
                    variant="outlined"
                    color="primary"
                    :rules="[ (v) => form.price > 0 || t('esim.required') ]"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    :model-value="form.countries"
                    @update:model-value="val => form.countries = val"
                    :items="countries"
                    :label="t('esim.countries')"
                    multiple
                    chips
                    variant="outlined"
                    color="primary"
                    :rules="[ (v) => v.length > 0 || t('esim.required') ]"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    :model-value="form.description"
                    @update:model-value="val => form.description = val"
                    :label="t('esim.description')"
                    prepend-inner-icon="mdi-information"
                    variant="outlined"
                    color="primary"
                    rows="3"
                  />
                </v-col>
              </v-row>
              <v-row justify="center" class="mt-6">
                <CustomButton type="submit" color="primary" :loading="isLoading" size="large" block>
                  {{ t('esim.addBtn') }}
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useNuxtApp } from '#app'

interface EsimForm {
  provider: string
  data: number
  price: number
  countries: string[]
  description?: string
}

const form = ref<EsimForm>({
  provider: '',
  data: 0,
  price: 0,
  countries: []
})
const isLoading = ref(false)
const formRef = ref()
const countries = ref(['USA', 'Europe', 'Asia', 'Worldwide']) // Mock countries

// Computed для number полей для SSR-совместимости
const dataStr = computed({
  get: () => form.value.data.toString(),
  set: (val: string) => { form.value.data = parseFloat(val) || 0 }
})
const priceStr = computed({
  get: () => form.value.price.toString(),
  set: (val: string) => { form.value.price = parseFloat(val) || 0 }
})

const { t } = useI18n()
const router = useRouter()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast

async function onSubmit() {
  if (!formRef.value?.validate()) return

  isLoading.value = true
  try {
    await $fetch('/api/esim', {
      method: 'POST',
      body: form.value,
      headers: {
        'X-CSRF-Token': nuxtApp.$csrfToken.value || ''
      }
    })
    $toast?.success(t('esim.successAdd'))
    router.push('/dashboard')
  } catch (error: any) {
    $toast?.error(error.data?.message || t('esim.errorAdd'))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>