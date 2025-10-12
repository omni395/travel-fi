<template>
  <v-card
    class="mx-auto"
    max-width="400"
    :style="{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px' }"
  >
    <v-card-title class="text-white">
      {{ t('dashboard.weeklyRewards') }}
      <v-tooltip :text="t('dashboard.weeklyRewardsHint')" location="top">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" size="small" class="ms-2">mdi-help-circle-outline</v-icon>
        </template>
      </v-tooltip>
    </v-card-title>

    <v-card-text>
      <div class="rewards-info">
        <!-- Points -->
        <div class="reward-section">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-white">{{ t('dashboard.points') }}</span>
            <span class="text-white">{{ stats.weekly.points }} / {{ stats.weekly.pointsLimit }}</span>
          </div>
          <v-progress-linear
            :model-value="(stats.weekly.points / stats.weekly.pointsLimit) * 100"
            :color="stats.weekly.points >= stats.weekly.pointsLimit ? 'warning' : 'primary'"
            rounded
            height="10"
          >
            <template v-slot:default="{ value }">
              <strong>{{ Math.round(value) }}%</strong>
            </template>
          </v-progress-linear>
        </div>

        <!-- Tokens -->
        <div v-if="stats.hasWallet" class="reward-section mt-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-white">{{ t('dashboard.tokens') }}</span>
            <span class="text-white">{{ stats.weekly.tokens }} / {{ stats.weekly.tokensLimit }}</span>
          </div>
          <v-progress-linear
            :model-value="(stats.weekly.tokens / stats.weekly.tokensLimit) * 100"
            :color="stats.weekly.tokens >= stats.weekly.tokensLimit ? 'warning' : 'secondary'"
            rounded
            height="10"
          >
            <template v-slot:default="{ value }">
              <strong>{{ Math.round(value) }}%</strong>
            </template>
          </v-progress-linear>
        </div>

        <div v-if="!stats.hasWallet" class="mt-4">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            :text="t('dashboard.connectWalletToEarn')"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface WeeklyRewards {
  points: number
  tokens: number
  pointsLimit: number
  tokensLimit: number
  pointsRemaining: number
  tokensRemaining: number
}

interface RewardStats {
  weekly: WeeklyRewards
  total: {
    points: number
    contributions: number
    reviews: number
    wifiPoints: number
    securityReports: number
  }
  hasWallet: boolean
}

const stats = ref<RewardStats>({
  weekly: {
    points: 0,
    tokens: 0,
    pointsLimit: 1000,
    tokensLimit: 50,
    pointsRemaining: 1000,
    tokensRemaining: 50
  },
  total: {
    points: 0,
    contributions: 0,
    reviews: 0,
    wifiPoints: 0,
    securityReports: 0
  },
  hasWallet: false
})

async function loadStats() {
  try {
    const res = await $fetch('/api/user/rewards')
    if (res.data) {
      stats.value = res.data
    }
  } catch (err) {
    console.error('Failed to load reward stats:', err)
  }
}

onMounted(loadStats)
</script>

<style scoped>
.rewards-info {
  padding: 8px;
}

.reward-section {
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}
</style>