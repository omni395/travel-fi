<template>
  <v-container fluid class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <CustomCard v-if="isAuthenticated">
          <v-card-title class="text-h4 primary--text mb-6">
            {{ t('profile.editTitle') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" ref="form">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="form.name"
                    @update:model-value="val => form.name = val"
                    :label="t('profile.name')"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    color="primary"
                    :rules="[ (v) => !!v || t('profile.required') ]"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="form.email"
                    @update:model-value="val => form.email = val"
                    type="email"
                    :label="t('profile.email')"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    color="primary"
                    readonly
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    :model-value="form.bio"
                    @update:model-value="val => form.bio = val"
                    :label="t('profile.bio')"
                    prepend-inner-icon="mdi-information-outline"
                    variant="outlined"
                    color="primary"
                    rows="4"
                  />
                </v-col>
              </v-row>
              <v-row justify="end" class="mt-6">
                <CustomButton type="submit" color="primary" :loading="isLoading">
                  {{ t('profile.saveBtn') }}
                </CustomButton>
              </v-row>
            </v-form>
            <v-divider class="my-6" />
            <v-card-actions>
              <CustomButton color="error" @click="handleLogout">
                {{ t('profile.logout') }}
              </CustomButton>
            </v-card-actions>
          </v-card-text>
        </CustomCard>
        <v-alert v-else type="error" class="ma-4">
          {{ t('profile.notAuthenticated') }}
          <NuxtLink to="/auth/login">{{ t('profile.login') }}</NuxtLink>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from '#app'
import { useUser } from '~/composables/useUser'

interface ProfileForm {
  name: string
  email: string
  bio?: string
}

const form = ref<ProfileForm>({
  name: '',
  email: '',
  bio: ''
})
const isLoading = ref(false)
const formRef = ref()

const { t } = useI18n()
const router = useRouter()
const { user } = useUser()
const logout = inject('logout') as () => void

const isAuthenticated = computed(() => !!user.value)

watch(user, (newUser) => {
  if (newUser) {
    form.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      bio: newUser.bio || ''
    }
  }
}, { immediate: true })

async function onSubmit() {
  if (!formRef.value?.validate()) return

  isLoading.value = true
  try {
    await $fetch('/api/profile', {
      method: 'PUT',
      body: form.value
    })
    $toast?.success(t('profile.successUpdate'))
  } catch (error: any) {
    $toast?.error(error.data?.message || t('profile.errorUpdate'))
  } finally {
    isLoading.value = false
  }
}

const handleLogout = () => {
  if (logout) logout()
  router.push('/auth/login')
}
</script>

<style scoped>
</style>