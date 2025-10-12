<template>
  <v-container
    fluid
    class="admin-settings-page pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <div class="d-flex align-center justify-space-between mb-4">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" :style="{ color: 'white', fontSize: '1rem' }">
        <template #divider>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>

      <h1 class="text-h4 mb-0 text-white">{{ t('admin.settings.title') || 'Settings' }}</h1>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4" :style="{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px' }">
          <v-card-title class="text-white pa-0">{{ t('admin.settings.rewards') || 'Rewards' }}</v-card-title>
          <v-card-text>
            <!-- Reward settings -->
            <h3 class="text-h6 mb-4 text-white">{{ t('admin.settings.rewards') || 'Rewards' }}</h3>

            <v-text-field 
              class="white-text-field" 
              v-model="settings.rewardWifiPoints" 
              type="number"
              :label="t('admin.settings.rewardWifiPoints') || 'Wi-Fi point reward'"
              hint="TRAVELFI tokens awarded after point approval"
            />
            <v-text-field 
              class="white-text-field" 
              v-model="settings.rewardSecurity" 
              type="number"
              :label="t('admin.settings.rewardSecurity') || 'Security report reward'"
              hint="TRAVELFI tokens for security reports"
            />
            <v-text-field 
              class="white-text-field" 
              v-model="settings.rewardReview" 
              type="number"
              :label="t('admin.settings.rewardReview') || 'Review reward'"
              hint="TRAVELFI tokens for reviews"
            />
            <v-text-field 
              class="white-text-field" 
              v-model="settings.rewardEsim" 
              type="number"
              :label="t('admin.settings.rewardEsim') || 'eSIM provider reward'"
              hint="TRAVELFI tokens for adding eSIM provider"
            />

            <!-- Points settings -->
            <h3 class="text-h6 mb-4 mt-6 text-white">{{ t('admin.settings.points') || 'Points' }}</h3>
            
            <v-text-field 
              class="white-text-field" 
              v-model="settings.pointsWifiPoints" 
              type="number"
              :label="t('admin.settings.pointsWifiPoints') || 'Wi-Fi point points'"
              hint="Points awarded after point approval"
            />
            <v-text-field 
              class="white-text-field" 
              v-model="settings.pointsSecurity" 
              type="number"
              :label="t('admin.settings.pointsSecurity') || 'Security report points'"
              hint="Points for security reports"
            />
            <v-text-field 
              class="white-text-field" 
              v-model="settings.pointsReview" 
              type="number"
              :label="t('admin.settings.pointsReview') || 'Review points'"
              hint="Points for reviews"
            />
            <v-text-field 
              class="white-text-field" 
              v-model="settings.pointsEsim" 
              type="number"
              :label="t('admin.settings.pointsEsim') || 'eSIM provider points'"
              hint="Points for adding eSIM provider"
            />
            
            <!-- Limits -->
            <h3 class="text-h6 mb-4 mt-6 text-white">{{ t('admin.settings.limits') || 'Limits' }}</h3>
            
            <v-text-field 
              class="white-text-field" 
              v-model="settings.weeklyRewardLimit" 
              type="number"
              :label="t('admin.settings.weeklyRewardLimit') || 'Weekly reward limit per user'"
              hint="Maximum TRAVELFI tokens per week"
            />
            <v-text-field 
              class="white-text-field" 
              v-model="settings.weeklyPointsLimit" 
              type="number"
              :label="t('admin.settings.weeklyPointsLimit') || 'Weekly points limit per user'"
              hint="Maximum points per week"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="tonal" color="error" class="mr-2" @click="resetToDefault">{{ t('admin.common.reset') || 'Reset' }}</v-btn>
            <v-btn color="primary" @click="save" :loading="saving">{{ t('admin.common.save') || 'Save' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'admin' })
const { t } = useI18n()
const localePath = useLocalePath()

const breadcrumbs = [ { title: t('admin.breadcrumbs.home') || 'Admin', to: localePath('/admin'), disabled: false }, { title: t('admin.settings.title') || 'Settings', to: localePath('/admin/settings'), disabled: true } ]

interface Settings {
  rewardWifiPoints: number
  rewardSecurity: number
  rewardReview: number
  rewardEsim: number
  pointsWifiPoints: number
  pointsSecurity: number
  pointsReview: number
  pointsEsim: number
  weeklyRewardLimit: number
  weeklyPointsLimit: number
  weeklyTokensLimit: number
}

const defaultSettings: Settings = {
  rewardWifiPoints: 10,
  rewardSecurity: 5,
  rewardReview: 3,
  rewardEsim: 15,
  pointsWifiPoints: 100,
  pointsSecurity: 50,
  pointsReview: 30,
  pointsEsim: 150,
  weeklyRewardLimit: 100,
  weeklyPointsLimit: 1000,
  weeklyTokensLimit: 50
}

const settings = ref<Settings>({ ...defaultSettings })
const saving = ref(false)

async function load() {
  try {
    const res: any = await $fetch('/api/admin/settings', { credentials: 'include' })
    if (res.data) {
      Object.keys(defaultSettings).forEach(key => {
        settings.value[key as keyof Settings] = res.data[key] ?? defaultSettings[key as keyof Settings]
      })
    }
  } catch (err) {
    console.error('Failed to load settings', err)
    useToast().error({ title: t('admin.common.error'), message: t('admin.settings.loadError') || 'Failed to load settings' })
  }
}

function resetToDefault() {
  settings.value = { ...defaultSettings }
}

onMounted(load)

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const updatedSettings = { ...settings.value }
    // Validate inputs
    Object.entries(updatedSettings).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        throw new Error(`Invalid value for ${key}. Must be a positive number.`)
      }
    })

    await $fetch('/api/admin/settings', {
      method: 'PUT',
      credentials: 'include',
      body: updatedSettings
    })
    
    useToast().success({ 
      title: t('admin.common.success') || 'Success', 
      message: t('admin.settings.saved') || 'Settings saved' 
    })
  } catch (err: unknown) {
    console.error('Failed to save settings', err)
    let message = 'Failed to save'
    if (err instanceof Error) message = err.message
    else if (typeof err === 'string') message = err
    else if (err && typeof err === 'object' && 'message' in err) message = String((err as any).message)
    useToast().error({ 
      title: t('admin.common.error') || 'Error', 
      message 
    })
  } finally {
    saving.value = false
  }
}
</script>
