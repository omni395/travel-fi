<template>
  <div class="reward-notification">
    <v-alert
      v-if="reward"
      color="success"
      variant="tonal"
      :icon="rewardIcon"
      class="mb-4"
    >
      <template v-slot:prepend>
        <v-avatar size="40" :image="badgeImage" v-if="badgeImage" />
      </template>
      
      <div class="d-flex flex-column">
        <div class="text-h6 mb-1">{{ title }}</div>
        <div v-if="reward.points > 0" class="mb-1">
          {{ t('reward.points', { points: reward.points }) }}
        </div>
        <div v-if="reward.tokens > 0">
          {{ t('reward.tokens', { tokens: reward.tokens }) }}
        </div>
      </div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  type: 'review' | 'security' | 'wifi' | 'esim'
  reward: { points: number; tokens: number } | null
}>()

const title = computed(() => {
  switch (props.type) {
    case 'review':
      return t('reward.reviewTitle')
    case 'security':
      return t('reward.securityTitle')
    case 'wifi':
      return t('reward.wifiTitle')
    case 'esim':
      return t('reward.esimTitle')
    default:
      return t('reward.defaultTitle')
  }
})

const rewardIcon = computed(() => {
  switch (props.type) {
    case 'review':
      return 'mdi-star'
    case 'security':
      return 'mdi-shield'
    case 'wifi':
      return 'mdi-wifi'
    case 'esim':
      return 'mdi-sim'
    default:
      return 'mdi-gift'
  }
})

const badgeImage = computed(() => {
  if (!props.reward) return null
  // Определяем какой значок показывать на основе количества очков/токенов
  const totalValue = props.reward.points + props.reward.tokens * 100
  if (totalValue >= 1000) return '/assets/images/platinum-logo-1.png'
  if (totalValue >= 500) return '/assets/images/gold-logo-1.png'
  if (totalValue >= 200) return '/assets/images/silver-logo-1.png'
  if (totalValue >= 100) return '/assets/images/bronze-logo-1.png'
  return '/assets/images/beginner-logo-1.png'
})
</script>

<style scoped>
.reward-notification {
  max-width: 400px;
  margin: 0 auto;
}
</style>