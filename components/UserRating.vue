<template>
  <v-card class="user-rating pa-4">
    <div class="d-flex align-center">
      <v-avatar :color="ratingColor" size="40">
        <v-icon>{{ ratingIcon }}</v-icon>
      </v-avatar>
      
      <div class="ml-4">
        <div class="text-h6">{{ level }}</div>
        <div class="text-subtitle-2">
          {{ reputation }} баллов репутации
        </div>
      </div>
    </div>

    <v-tooltip location="bottom">
      <template v-slot:activator="{ props }">
        <v-progress-linear
          v-bind="props"
          :model-value="reputationProgress"
          :color="ratingColor"
          height="8"
          class="mt-4"
        />
      </template>
      <span>До следующего уровня: {{ pointsToNextLevel }} баллов</span>
    </v-tooltip>

    <div class="mt-4 text-body-2">
      <div class="d-flex justify-space-between">
        <span>Всего голосов:</span>
        <span>{{ totalVotes }}</span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  reputation: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  totalVotes: {
    type: Number,
    required: true
  }
})

const LEVELS = {
  UNTRUSTED: {
    color: 'error',
    icon: 'mdi-alert-circle',
    nextLevel: 0
  },
  SUSPICIOUS: {
    color: 'warning',
    icon: 'mdi-alert',
    nextLevel: 0
  },
  NEUTRAL: {
    color: 'info',
    icon: 'mdi-account',
    nextLevel: 50
  },
  TRUSTED: {
    color: 'success',
    icon: 'mdi-check-circle',
    nextLevel: 100
  },
  VERIFIED: {
    color: 'primary',
    icon: 'mdi-shield-check',
    nextLevel: Infinity
  }
}

const ratingColor = computed(() => LEVELS[props.level]?.color || 'grey')
const ratingIcon = computed(() => LEVELS[props.level]?.icon || 'mdi-account')

const reputationProgress = computed(() => {
  const currentLevel = LEVELS[props.level]
  const nextLevel = LEVELS[props.level]?.nextLevel || 100
  if (nextLevel === Infinity) return 100
  
  const progress = (props.reputation / nextLevel) * 100
  return Math.min(Math.max(progress, 0), 100)
})

const pointsToNextLevel = computed(() => {
  const nextLevel = LEVELS[props.level]?.nextLevel || 100
  if (nextLevel === Infinity) return 0
  return Math.max(nextLevel - props.reputation, 0)
})
</script>

<style scoped>
.user-rating {
  max-width: 400px;
}
</style>