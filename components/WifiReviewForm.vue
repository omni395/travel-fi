<template>
  <v-form @submit.prevent="submit" class="wifi-review-form">
    <v-card variant="tonal">
      <v-card-title>{{ t('wifi.review.title') }}</v-card-title>
      <v-card-text>
        <v-rating
          v-model="rating"
          :label="t('wifi.review.ratingLabel')"
          :rules="[v => !!v || t('wifi.review.ratingRequired')]"
          color="primary"
          required
        />

        <v-textarea
          v-model="comment"
          :label="t('wifi.review.comment')"
          :placeholder="t('wifi.review.commentPlaceholder')"
          :hint="t('wifi.review.commentHint')"
          persistent-hint
          rows="3"
          max-length="500"
        />

        <reward-notification
          v-if="reward"
          type="review"
          :reward="reward"
          class="mt-4"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('cancel')"
        >
          {{ t('wifi.review.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="loading"
          :disabled="!rating"
        >
          {{ t('wifi.review.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import RewardNotification from './RewardNotification.vue'

const { t } = useI18n()

const props = defineProps<{
  targetId: number
  targetType: 'wifi' | 'esim'
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'error', err: Error): void
  (e: 'cancel'): void
}>()

const rating = ref<number>(0)
const comment = ref<string>('')
const loading = ref(false)
const reward = ref(null)

async function submit() {
  if (loading.value) return
  loading.value = true
  
  try {
    const response = await $fetch('/api/reviews/create', {
      method: 'POST',
      body: {
        targetId: props.targetId,
        targetType: props.targetType,
        rating: rating.value,
        comment: comment.value
      }
    })
    reward.value = response.reward
    emit('success')
  } catch (err) {
    console.error('Failed to submit review', err)
    emit('error', err instanceof Error ? err : new Error('Failed to submit review'))
  } finally {
    loading.value = false
  }
}
</script>