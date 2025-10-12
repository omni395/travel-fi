<template>
  <div class="security-tab">
    <!-- Общая оценка безопасности -->
    <v-card variant="tonal" class="mb-4">
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <div class="text-h6">{{ t('wifi.detail.averageSecurityRating') }}</div>
          <div class="text-h4" :class="securityScoreColor">
            {{ securityScore }}%
          </div>
        </div>
        <v-progress-linear
          :model-value="securityScore"
          :color="securityScoreColor"
          height="8"
          rounded
          class="mt-2"
        />
      </v-card-text>
    </v-card>

    <!-- Отчеты о безопасности -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ t('wifi.detail.securityReports') }}</span>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-shield"
          @click="showReportForm = true"
          v-if="!userHasReported"
        >
          {{ t('wifi.reportSecurity') }}
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="securityReports.length === 0"
          type="info"
          variant="tonal"
        >
          <div class="text-center">
            <div>{{ t('wifi.detail.noSecurityReports') }}</div>
            <div class="text-subtitle-2">
              {{ t('wifi.detail.securityBeFirst') }}
            </div>
          </div>
        </v-alert>

        <v-timeline v-else density="compact" align="start">
          <v-timeline-item
            v-for="report in securityReports"
            :key="report.id"
            :dot-color="getReportColor(report.rating)"
            size="small"
          >
            <template v-slot:opposite>
              {{ formatDate(report.createdAt) }}
            </template>

            <v-card variant="text">
              <div class="d-flex align-center mb-2">
                <v-rating
                  :model-value="report.rating"
                  color="error"
                  density="compact"
                  readonly
                  half-increments
                />
                <v-spacer />
                <v-menu v-if="canManageReport(report)">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      size="small"
                      variant="text"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item
                      prepend-icon="mdi-delete"
                      :title="t('common.delete')"
                      @click="deleteReport(report.id)"
                      color="error"
                    />
                  </v-list>
                </v-menu>
              </div>

              <div class="text-body-2">{{ report.risks }}</div>
              <div class="text-caption text-grey" v-if="report.comment">
                {{ report.comment }}
              </div>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>

    <!-- Форма отчета -->
    <v-dialog v-model="showReportForm" max-width="600">
      <security-report-form
        :wifi-point-id="wifiPointId"
        @success="onReportSuccess"
        @error="onReportError"
        @cancel="showReportForm = false"
      />
    </v-dialog>

    <!-- Подтверждение удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>{{ t('common.confirm') }}</v-card-title>
        <v-card-text>
          {{ t('wifi.securityReport.confirmDelete') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="deleting"
          >
            {{ t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUser } from '~/composables/useUser'
import { formatDate } from '~/lib/formatDate'
import SecurityReportForm from './SecurityReportForm.vue'

const { t } = useI18n()
const { user } = useUser()

const props = defineProps<{
  wifiPointId: number
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const securityReports = ref<any[]>([])
const loading = ref(false)
const showReportForm = ref(false)
const showDeleteDialog = ref(false)
const deleting = ref(false)
const reportToDelete = ref<number | null>(null)

// Вычисляемые свойства
const securityScore = computed(() => {
  if (securityReports.value.length === 0) return 100
  const totalRating = securityReports.value.reduce((sum, report) => sum + report.rating, 0)
  return Math.round((totalRating / (securityReports.value.length * 5)) * 100)
})

const securityScoreColor = computed(() => {
  if (securityScore.value >= 80) return 'success'
  if (securityScore.value >= 60) return 'warning'
  return 'error'
})

const userHasReported = computed(() => {
  return securityReports.value.some(report => report.userId === user.value?.id)
})

// Методы
async function loadReports() {
  loading.value = true
  try {
    const response = await $fetch(`/api/security/reports/${props.wifiPointId}`)
    securityReports.value = response.data || []
  } catch (err) {
    console.error('Failed to load security reports', err)
    // Показать ошибку пользователю
  } finally {
    loading.value = false
  }
}

function getReportColor(rating: number) {
  if (rating >= 4) return 'success'
  if (rating >= 3) return 'warning'
  return 'error'
}

function canManageReport(report: any) {
  return user.value?.id === report.userId || ['ADMIN', 'MODERATOR'].includes(user.value?.role || '')
}

function deleteReport(id: number) {
  reportToDelete.value = id
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!reportToDelete.value || deleting.value) return
  deleting.value = true

  try {
    await $fetch(`/api/security/${reportToDelete.value}/delete`, { method: 'POST' })
    showDeleteDialog.value = false
    loadReports()
    emit('refresh')
  } catch (err) {
    console.error('Failed to delete security report', err)
    // Показать ошибку пользователю
  } finally {
    deleting.value = false
    reportToDelete.value = null
  }
}

function onReportSuccess() {
  showReportForm.value = false
  loadReports()
  emit('refresh')
}

function onReportError(err: Error) {
  console.error('Failed to submit report', err)
  // Показать ошибку пользователю
}

// Загружаем данные при монтировании
onMounted(loadReports)
</script>

<style scoped>
.security-tab {
  padding: 16px;
}
</style>