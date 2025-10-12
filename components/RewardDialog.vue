<template>
  <v-dialog
    v-model="dialog"
    max-width="400"
    persistent
    :fullscreen="$vuetify.display.mobile"
  >
    <v-card class="reward-dialog">
      <div class="reward-animation">
        <v-icon
          size="64"
          color="amber"
          class="reward-icon"
        >
          mdi-star-face
        </v-icon>
      </div>
      
      <v-card-title class="text-center text-h4 font-weight-bold">
        {{ title }}
      </v-card-title>

      <v-card-text class="text-center">
        <div class="text-h5 mb-4">
          <div class="points-text">
            +{{ points }} {{ t('dashboard.points') }}
          </div>
          <div v-if="tokens > 0" class="tokens-text">
            +{{ tokens }} TRAVELFI
          </div>
        </div>

        <v-chip
          v-if="badge"
          color="primary"
          size="large"
          class="mb-4 badge-chip"
        >
          <v-icon start>mdi-shield-star</v-icon>
          {{ t(`badges.${badge}`) }}
        </v-chip>

        <div v-if="message" class="message-text">
          {{ message }}
        </div>
      </v-card-text>

      <v-card-actions class="justify-center pa-4">
        <v-btn
          color="primary"
          size="large"
          variant="elevated"
          @click="close"
        >
          {{ t('common.awesome') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  title: string
  points: number
  tokens?: number
  badge?: string
  message?: string
}>()

const dialog = ref(true)

const emit = defineEmits(['close'])

function close() {
  dialog.value = false
  emit('close')
}
</script>

<style scoped>
.reward-dialog {
  background: linear-gradient(135deg, #1a237e 0%, #0288d1 100%);
  color: white;
  padding: 2rem;
}

.reward-animation {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.reward-icon {
  animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.points-text {
  animation: slide-up 0.5s ease-out;
  animation-delay: 0.2s;
  opacity: 0;
  animation-fill-mode: forwards;
}

.tokens-text {
  animation: slide-up 0.5s ease-out;
  animation-delay: 0.4s;
  opacity: 0;
  animation-fill-mode: forwards;
}

.badge-chip {
  animation: scale-in 0.5s ease-out;
  animation-delay: 0.6s;
  opacity: 0;
  animation-fill-mode: forwards;
}

.message-text {
  animation: fade-in 0.5s ease-out;
  animation-delay: 0.8s;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes pop-in {
  0% {
    transform: scale(0);
  }
  80% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes slide-up {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>