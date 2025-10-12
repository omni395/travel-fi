<template>
  <v-dialog
    v-model="localDialog"
    max-width="1000"
    scrollable
  >
    <v-card v-if="point">
      <v-card-title class="d-flex justify-space-between align-center bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon
            :color="getConnectionTypeColor(point.connectionType)"
            size="32"
            class="mr-3"
          >
            {{ getConnectionTypeIcon(point.connectionType) }}
          </v-icon>
          <div>
            <h2 class="text-h5 text-white mb-1">{{ point.ssid }}</h2>
            <div class="d-flex align-center gap-2">
              <v-chip
                v-if="point.averageRating > 0"
                size="small"
                color="amber"
                variant="flat"
                prepend-icon="mdi-star"
              >
                {{ point.averageRating.toFixed(1) }}
              </v-chip>
              <v-chip
                size="small"
                :color="getStatusColor(point.status)"
                variant="flat"
              >
                {{ t(`wifi.detail.${point.status}`) }}
              </v-chip>
            </div>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text class="pa-0">
        <v-tabs
          v-model="activeTab"
          bg-color="grey-lighten-4"
          color="primary"
        >
          <v-tab value="info">
            <v-icon start>mdi-information</v-icon>
            {{ t('wifi.detail.tabs.info') }}
          </v-tab>
          <v-tab value="reviews">
            <v-icon start>mdi-star</v-icon>
            {{ t('wifi.detail.tabs.reviews') }}
            <v-badge
              v-if="point.reviewCount > 0"
              :content="point.reviewCount"
              color="primary"
              inline
              class="ml-2"
            />
          </v-tab>
          <v-tab value="security">
            <v-icon start>mdi-shield-check</v-icon>
            {{ t('wifi.detail.tabs.security') }}
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="pa-6">
          <!-- Информация -->
          <v-window-item value="info">
            <v-row>
              <v-col cols="12" md="6">
                <v-list lines="two">
                  <v-list-item>
                    <template #prepend>
                      <v-icon color="primary">mdi-wifi</v-icon>
                    </template>
                    <v-list-item-title>{{ t('wifi.detail.ssid') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ point.ssid }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon :color="point.password ? 'warning' : 'success'">
                        {{ point.password ? 'mdi-lock' : 'mdi-lock-open' }}
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ t('wifi.detail.password') }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ point.password ? point.password : t('wifi.detail.noPassword') }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon color="primary">mdi-connection</v-icon>
                    </template>
                    <v-list-item-title>{{ t('wifi.detail.connectionType') }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ t(`wifi.form.${point.connectionType.toLowerCase().replace('-', '')}`) }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="point.speed">
                    <template #prepend>
                      <v-icon :color="getSpeedColor(point.speed)">mdi-speedometer</v-icon>
                    </template>
                    <v-list-item-title>{{ t('wifi.detail.speed') }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ t(`wifi.form.${point.speed.toLowerCase()}`) }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon color="primary">mdi-map-marker</v-icon>
                    </template>
                    <v-list-item-title>{{ t('wifi.detail.location') }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ point.lat.toFixed(6) }}, {{ point.lng.toFixed(6) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <v-divider class="my-4" />

                <div class="mb-4">
                  <h3 class="text-subtitle-1 mb-2">{{ t('wifi.tags') }}</h3>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="tag in point.tags"
                      :key="tag"
                      size="small"
                      color="primary"
                      variant="tonal"
                    >
                      {{ t(`wifi.tags.${tag}`) || tag }}
                    </v-chip>
                  </div>
                </div>

                <div v-if="point.description">
                  <h3 class="text-subtitle-1 mb-2">{{ t('wifi.detail.description') }}</h3>
                  <p class="text-body-2">{{ point.description }}</p>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div
                  class="map-container"
                  :style="{
                    height: '300px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                  }"
                >
                  <ClientOnly>
                    <CustomMap
                      :center="[point.lat, point.lng]"
                      :zoom="15"
                      :markers="[
                        {
                          id: point.id,
                          lat: point.lat,
                          lng: point.lng,
                          label: point.ssid,
                        },
                      ]"
                      height="300px"
                    />
                  </ClientOnly>
                </div>

                <v-card variant="outlined" class="mb-4">
                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <v-avatar size="40" class="mr-3">
                        <v-img
                          v-if="point.user?.profilePicture"
                          :src="point.user.profilePicture"
                          :alt="point.user.name || 'User'"
                        />
                        <v-icon v-else>mdi-account</v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-2">{{ t('wifi.detail.addedBy') }}</div>
                        <div class="text-body-2 text-grey-darken-1">
                          {{ point.user?.name || t('common.anonymous') }}
                        </div>
                      </div>
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      {{ t('wifi.detail.addedOn') }}: {{ formatDate(point.createdAt) }}
                    </div>
                    <div v-if="point.user?.badges && point.user.badges.length > 0" class="mt-2">
                      <v-chip
                        v-for="badge in point.user.badges"
                        :key="badge"
                        size="x-small"
                        color="primary"
                        variant="outlined"
                        class="mr-1"
                      >
                        {{ badge }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>

                <v-card variant="outlined">
                  <v-card-text>
                    <div class="d-flex justify-space-around text-center">
                      <div>
                        <div class="text-h6 text-primary">
                          {{ point.averageRating.toFixed(1) }}
                        </div>
                        <div class="text-caption text-grey-darken-1">
                          {{ t('wifi.detail.averageRating') }}
                        </div>
                      </div>
                      <v-divider vertical />
                      <div>
                        <div class="text-h6 text-primary">{{ point.reviewCount }}</div>
                        <div class="text-caption text-grey-darken-1">
                          {{ t('wifi.detail.reviewCount') }}
                        </div>
                      </div>
                      <v-divider vertical />
                      <div>
                        <div class="d-flex align-center">
                          <span class="text-h6" :class="getSecurityScoreClass(point.securityScore)">
                            {{ point.securityScore }}%
                          </span>
                          <v-icon size="small" :color="point.securityScore >= 80 ? 'success' : point.securityScore >= 50 ? 'warning' : 'error'" class="ml-1">mdi-shield-check</v-icon>
                        </div>
                        <div class="text-caption text-grey-darken-1">
                          {{ t('wifi.detail.securityScore') }}
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Отзывы -->
          <v-window-item value="reviews">
            <div v-if="point.reviews && point.reviews.length > 0">
              <v-row class="mb-6">
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text class="text-center pa-6">
                      <v-progress-circular
                        :model-value="(point.averageRating / 5) * 100"
                        color="amber"
                        :size="120"
                        :width="12"
                      >
                        <span class="text-h4 text-amber">
                          {{ point.averageRating.toFixed(1) }}
                        </span>
                      </v-progress-circular>
                      <h3 class="text-h6 mt-4">{{ t('wifi.detail.averageRating') }}</h3>
                      <p class="text-caption text-grey-darken-1 mb-0">
                        {{ point.reviewCount }} {{ t('wifi.detail.reviewCount') }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="8">
                  <h3 class="text-subtitle-1 mb-3">{{ t('wifi.rating') }}</h3>
                  <div
                    v-for="rating in [5, 4, 3, 2, 1]"
                    :key="rating"
                    class="d-flex align-center mb-2"
                  >
                    <span class="text-body-2" style="width: 30px">{{ rating }}</span>
                    <v-icon size="16" color="amber">mdi-star</v-icon>
                    <v-progress-linear
                      :model-value="point.ratingDistribution && point.ratingDistribution[rating] ? (point.ratingDistribution[rating] / point.reviewCount) * 100 : 0"
                      color="amber"
                      height="8"
                      rounded
                      class="mx-3 flex-grow-1"
                    />
                    <span class="text-caption text-grey-darken-1" style="width: 40px">
                      {{ point.ratingDistribution && point.ratingDistribution[rating] ? point.ratingDistribution[rating] : 0 }}
                    </span>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <h3 class="text-subtitle-1 mb-3">{{ t('wifi.reviews') }}</h3>
              <div
                v-for="review in point.reviews"
                :key="review.id"
                class="mb-4"
              >
                <v-card variant="outlined">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div class="d-flex align-center">
                        <v-avatar size="32" class="mr-2">
                          <v-img
                            v-if="review.user?.profilePicture"
                            :src="review.user.profilePicture"
                            :alt="review.user.name || 'User'"
                          />
                          <v-icon v-else size="20">mdi-account</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2">
                            {{ review.user?.name || t('common.anonymous') }}
                          </div>
                          <div class="text-caption text-grey-darken-1">
                            {{ formatDate(review.createdAt) }}
                          </div>
                        </div>
                      </div>
                      <v-rating
                        :model-value="review.rating"
                        color="amber"
                        density="compact"
                        size="small"
                        readonly
                      />
                    </div>
                    <p v-if="review.comment" class="text-body-2 mb-0">
                      {{ review.comment }}
                    </p>
                    
                    <!-- Кнопки для владельца отзыва -->
                    <div v-if="currentUser?.id === review.user?.id" class="d-flex gap-2 mt-3">
                      <v-btn
                        size="small"
                        variant="text"
                        color="info"
                        prepend-icon="mdi-pencil"
                        @click="$emit('edit-review', review)"
                      >
                        {{ t('common.edit') || 'Edit' }}
                      </v-btn>
                      <v-btn
                        size="small"
                        variant="text"
                        color="error"
                        prepend-icon="mdi-delete"
                        @click="$emit('delete-review', review)"
                      >
                        {{ t('common.delete') || 'Delete' }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>

            <v-empty-state
              v-else
              icon="mdi-star-outline"
              :title="t('wifi.detail.noReviews')"
              :text="t('wifi.detail.beFirst')"
            >
              <template #actions>
                <v-btn
                  v-if="!hasUserReview"
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-star-plus"
                  @click="$emit('add-review', point)"
                >
                  {{ t('wifi.addReview') }}
                </v-btn>
              </template>
            </v-empty-state>
          </v-window-item>

          <!-- Безопасность -->
          <v-window-item value="security">
            <div v-if="point.securityReports && point.securityReports.length > 0">
              <v-row class="mb-6">
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text class="text-center pa-6">
                      <v-progress-circular
                        :model-value="(averageSecurityRating / 5) * 100"
                        color="amber"
                        :size="120"
                        :width="12"
                      >
                        <span class="text-h4 text-amber">
                          {{ averageSecurityRating.toFixed(1) }}
                        </span>
                      </v-progress-circular>
                      <h3 class="text-h6 mt-4">{{ t('wifi.detail.averageSecurityRating') || 'Average Security Rating' }}</h3>
                      <p class="text-caption text-grey-darken-1 mb-0">
                        {{ point.securityReportCount }} {{ t('wifi.detail.securityReports') }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="8">
                  <h3 class="text-subtitle-1 mb-3">{{ t('wifi.rating') }}</h3>
                  <div
                    v-for="rating in [5, 4, 3, 2, 1]"
                    :key="rating"
                    class="d-flex align-center mb-2"
                  >
                    <span class="text-body-2" style="width: 30px">{{ rating }}</span>
                    <v-icon size="16" color="amber">mdi-star</v-icon>
                    <v-progress-linear
                      :model-value="securityRatingDistribution[rating] ? (securityRatingDistribution[rating] / point.securityReportCount) * 100 : 0"
                      color="amber"
                      height="8"
                      rounded
                      class="mx-3 flex-grow-1"
                    />
                    <span class="text-caption text-grey-darken-1" style="width: 40px">
                      {{ securityRatingDistribution[rating] || 0 }}
                    </span>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <h3 class="text-subtitle-1 mb-3">{{ t('wifi.detail.securityReports') }}</h3>
              <div
                v-for="report in point.securityReports"
                :key="report.id"
                class="mb-4"
              >
                <v-card variant="outlined">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div class="d-flex align-center">
                        <v-avatar size="32" class="mr-2">
                          <v-img
                            v-if="report.user?.profilePicture"
                            :src="report.user.profilePicture"
                            :alt="report.user.name || 'User'"
                          />
                          <v-icon v-else size="20">mdi-account</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2">
                            {{ report.user?.name || t('common.anonymous') }}
                          </div>
                          <div class="text-caption text-grey-darken-1">
                            {{ formatDate(report.createdAt) }}
                          </div>
                        </div>
                      </div>
                      <v-rating
                        v-if="report.rating"
                        :model-value="report.rating"
                        color="amber"
                        density="compact"
                        size="small"
                        readonly
                      />
                    </div>
                    <p v-if="report.risks" class="text-body-2 mb-0">
                      {{ report.risks }}
                    </p>
                    
                    <!-- Кнопки для владельца отчета -->
                    <div v-if="currentUser?.id === report.user?.id" class="d-flex gap-2 mt-3">
                      <v-btn
                        size="small"
                        variant="text"
                        color="info"
                        prepend-icon="mdi-pencil"
                        @click="$emit('edit-security-report', report)"
                      >
                        {{ t('common.edit') || 'Edit' }}
                      </v-btn>
                      <v-btn
                        size="small"
                        variant="text"
                        color="error"
                        prepend-icon="mdi-delete"
                        @click="$emit('delete-security-report', report)"
                      >
                        {{ t('common.delete') || 'Delete' }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>

            <v-empty-state
              v-else
              icon="mdi-shield-check-outline"
              :title="t('wifi.detail.noSecurityReports') || 'No security reports'"
              :text="t('wifi.detail.securityBeFirst') || 'Be the first to report security issues'"
            >
              <template #actions>
                <v-btn
                  v-if="!hasUserSecurityReport"
                  color="warning"
                  variant="elevated"
                  prepend-icon="mdi-shield-alert"
                  @click="$emit('report-security', point)"
                >
                  {{ t('wifi.reportSecurity') }}
                </v-btn>
              </template>
            </v-empty-state>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          v-if="!hasUserReview"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-star-plus"
          @click="$emit('add-review', point)"
        >
          {{ t('wifi.addReview') }}
        </v-btn>
        <v-btn
          v-if="!hasUserSecurityReport"
          variant="tonal"
          color="warning"
          prepend-icon="mdi-shield-alert"
          @click="$emit('report-security', point)"
        >
          {{ t('wifi.reportSecurity') }}
        </v-btn>
        
        <!-- Кнопки для владельца точки -->
        <template v-if="isOwner">
          <v-btn
            variant="tonal"
            color="info"
            prepend-icon="mdi-pencil"
            @click="$emit('edit-point', point)"
          >
            {{ t('common.edit') || 'Edit' }}
          </v-btn>
          <v-btn
            variant="tonal"
            color="error"
            prepend-icon="mdi-delete"
            @click="$emit('delete-point', point)"
          >
            {{ t('common.delete') || 'Delete' }}
          </v-btn>
        </template>
        
        <v-spacer />
        <v-btn
          variant="elevated"
          color="grey-darken-1"
          @click="closeDialog"
        >
          {{ t('common.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface WifiPoint {
  id: number
  ssid: string
  lat: number
  lng: number
  password?: string | null
  tags: string[]
  connectionType: string
  speed?: string | null
  description?: string | null
  status: string
  averageRating: number
  reviewCount: number
  securityReportCount: number
  securityScore: number
  ratingDistribution?: Record<number, number>
  user?: {
    id: number
    name?: string | null
    profilePicture?: string | null
    badges: string[]
  }
  reviews?: any[]
  securityReports?: any[]
  createdAt: string
}

const props = defineProps<{
  modelValue: boolean
  point: WifiPoint | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'add-review', point: WifiPoint): void
  (e: 'report-security', point: WifiPoint): void
  (e: 'edit-point', point: WifiPoint): void
  (e: 'delete-point', point: WifiPoint): void
  (e: 'edit-review', review: any): void
  (e: 'delete-review', review: any): void
  (e: 'edit-security-report', report: any): void
  (e: 'delete-security-report', report: any): void
}>()

const localDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const activeTab = ref('info')

// Получаем текущего пользователя
const { user: currentUser } = useUser()

// Проверяем, есть ли у пользователя отзыв для этой точки
const hasUserReview = computed(() => {
  if (!currentUser.value?.id || !props.point?.reviews) return false
  return props.point.reviews.some(review => review.userId === currentUser.value?.id)
})

// Проверяем, есть ли у пользователя отчет о безопасности для этой точки
const hasUserSecurityReport = computed(() => {
  if (!currentUser.value?.id || !props.point?.securityReports) return false
  return props.point.securityReports.some(report => report.userId === currentUser.value?.id)
})

// Проверяем, является ли текущий пользователь владельцем точки
const isOwner = computed(() => {
  return currentUser.value?.id === props.point?.userId
})

// Вычисляем средний рейтинг безопасности
const averageSecurityRating = computed(() => {
  if (!props.point?.securityReports || props.point.securityReports.length === 0) return 0
  const reportsWithRating = props.point.securityReports.filter((r: any) => r.rating)
  if (reportsWithRating.length === 0) return 0
  const sum = reportsWithRating.reduce((acc: number, r: any) => acc + r.rating, 0)
  return sum / reportsWithRating.length
})

// Вычисляем распределение рейтингов безопасности
const securityRatingDistribution = computed(() => {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  if (!props.point?.securityReports) return distribution
  
  props.point.securityReports.forEach((report: any) => {
    if (report.rating && report.rating >= 1 && report.rating <= 5) {
      distribution[report.rating]++
    }
  })
  
  return distribution
})

function closeDialog() {
  localDialog.value = false
}

function getConnectionTypeIcon(type: string): string {
  switch (type) {
    case 'Free':
      return 'mdi-wifi'
    case 'Paid':
      return 'mdi-currency-usd'
    case 'Password-Protected':
      return 'mdi-wifi-lock'
    default:
      return 'mdi-wifi'
  }
}

function getConnectionTypeColor(type: string): string {
  switch (type) {
    case 'Free':
      return 'white'
    case 'Paid':
      return 'white'
    case 'Password-Protected':
      return 'white'
    default:
      return 'white'
  }
}

function getSpeedColor(speed: string): string {
  switch (speed) {
    case 'Fast':
      return 'success'
    case 'Medium':
      return 'warning'
    case 'Slow':
      return 'error'
    default:
      return 'grey'
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'error'
    default:
      return 'grey'
  }
}

function getSecurityColor(reportCount: number): string {
  if (reportCount === 0) return 'success'
  if (reportCount <= 2) return 'warning'
  return 'error'
}

function getSecurityScoreClass(score: number): string {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-error'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
