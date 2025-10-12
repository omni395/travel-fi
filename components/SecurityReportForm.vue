<template>
  <v-form @submit.prevent="submit" class="security-report-form">
    <v-card variant="tonal">
      <v-card-title>{{ t('wifi.securityReport.title') }}</v-card-title>
      <v-card-text>
        <v-rating
          v-model="rating"
          :label="t('wifi.securityReport.ratingLabel')"
          color="error"
          hover
          required
        />

        <v-textarea
          v-model="risks"
          :label="t('wifi.securityReport.description')"
          :placeholder="t('wifi.securityReport.descriptionPlaceholder')"
          :hint="t('wifi.securityReport.descriptionHint')"
          persistent-hint
          :rules="[
            v => !!v || t('wifi.securityReport.required'),
            v => v.length >= 10 || t('wifi.securityReport.minLength'),
            v => v.length <= 1000 || t('wifi.securityReport.maxLength')
          ]"
          required
          rows="4"
        />

        <v-textarea
          v-model="comment"
          :label="t('wifi.securityReport.additionalComment')"
          :placeholder="t('wifi.securityReport.commentPlaceholder')"
          rows="2"
        />

        <reward-notification
          v-if="reward"
          type="security"
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
          {{ t('wifi.securityReport.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="loading"
          :disabled="!isValid"
        >
          {{ t('wifi.securityReport.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RewardNotification from './RewardNotification.vue'

const { t } = useI18n()

const props = defineProps<{
  wifiPointId: number
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'error', err: Error): void
  (e: 'cancel'): void
}>()

const rating = ref<number>(3)
const risks = ref<string>('')
const comment = ref<string>('')
const loading = ref(false)
const reward = ref(null)

const isValid = computed(() => {
  return rating.value > 0 && risks.value.length >= 10 && risks.value.length <= 1000
})

async function submit() {
  if (loading.value || !isValid.value) return
  loading.value = true
  
  try {
    const response = await $fetch('/api/security/report', {
      method: 'POST',
      body: {
        wifiPointId: props.wifiPointId,
        rating: rating.value,
        risks: risks.value,
        comment: comment.value
      }
    })
    reward.value = response.reward
    emit('success')
  } catch (err) {
    console.error('Failed to submit security report', err)
    emit('error', err instanceof Error ? err : new Error('Failed to submit security report'))
  } finally {
    loading.value = false
  }
}
</script>