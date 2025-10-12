<template>
  <v-card
    class="wifi-filters"
    :style="{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
    }"
    elevation="2"
  >
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ t('wifi.filters') }}</span>
      <v-btn
        size="small"
        variant="text"
        color="primary"
        @click="clearFilters"
      >
        {{ t('wifi.clearFilters') }}
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Поиск -->
      <v-text-field
        v-model="localFilters.search"
        :label="t('wifi.search')"
        :placeholder="t('wifi.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="mb-4"
        @update:model-value="debouncedEmit"
      />

      <!-- Местоположение -->
      <div class="mb-4">
        <v-btn
          block
          variant="tonal"
          color="primary"
          prepend-icon="mdi-crosshairs-gps"
          :loading="gettingLocation"
          @click="useMyLocation"
        >
          {{ t('wifi.myLocation') }}
        </v-btn>
      </div>

      <v-divider class="my-4" />

      <!-- Радиус поиска (если есть координаты) -->
      <div v-if="localFilters.lat && localFilters.lng" class="mb-4">
        <label class="text-caption text-grey-darken-1 mb-2 d-block">
          {{ t('wifi.distance') }}: {{ localFilters.radius >= 1000 ? (localFilters.radius/1000) + 'km' : localFilters.radius + 'm' }}
        </label>
        <v-slider
          v-model="localFilters.radius"
          :min="50"
          :max="50000"
          :step="50"
          thumb-label
          color="primary"
          @update:model-value="debouncedEmit"
        />
      </div>

      <!-- Тип подключения -->
      <v-select
        v-model="localFilters.connectionType"
        :label="t('wifi.filterByType')"
        :items="connectionTypes"
        item-title="text"
        item-value="value"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="mb-4"
        @update:model-value="emitFilters"
      />

      <!-- Скорость -->
      <v-select
        v-model="localFilters.speed"
        :label="t('wifi.filterBySpeed')"
        :items="speedOptions"
        item-title="text"
        item-value="value"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="mb-4"
        @update:model-value="emitFilters"
      />

      <!-- Теги -->
      <v-autocomplete
        v-model="localFilters.tags"
        :label="t('wifi.filterByTags')"
        :items="availableTags"
        item-title="text"
        item-value="value"
        variant="outlined"
        density="compact"
        multiple
        chips
        closable-chips
        hide-details
        class="mb-4"
        @update:model-value="emitFilters"
      />

      <!-- Сортировка -->
      <v-select
        v-model="localFilters.sortBy"
        :label="t('common.sort')"
        :items="sortOptions"
        item-title="text"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        @update:model-value="emitFilters"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toast = useToast()

interface Filters {
  search: string
  lat: number | null
  lng: number | null
  radius: number
  connectionType: string | null
  speed: string | null
  tags: string[]
  sortBy: string
}

const props = defineProps<{
  modelValue?: Filters
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', filters: Filters): void
}>()

const gettingLocation = ref(false)

const localFilters = reactive<Filters>({
  search: props.modelValue?.search || '',
  lat: props.modelValue?.lat || null,
  lng: props.modelValue?.lng || null,
  radius: props.modelValue?.radius || 10,
  connectionType: props.modelValue?.connectionType || null,
  speed: props.modelValue?.speed || null,
  tags: props.modelValue?.tags || [],
  sortBy: props.modelValue?.sortBy || 'distance',
})

const connectionTypes = [
  { text: t('wifi.form.free'), value: 'Free' },
  { text: t('wifi.form.paid'), value: 'Paid' },
  { text: t('wifi.form.passwordProtected'), value: 'Password-Protected' },
]

const speedOptions = [
  { text: t('wifi.form.fast'), value: 'Fast' },
  { text: t('wifi.form.medium'), value: 'Medium' },
  { text: t('wifi.form.slow'), value: 'Slow' },
]

const availableTags = [
  { text: t('wifi.tags.cafe'), value: 'cafe' },
  { text: t('wifi.tags.restaurant'), value: 'restaurant' },
  { text: t('wifi.tags.hotel'), value: 'hotel' },
  { text: t('wifi.tags.airport'), value: 'airport' },
  { text: t('wifi.tags.mall'), value: 'mall' },
  { text: t('wifi.tags.library'), value: 'library' },
  { text: t('wifi.tags.park'), value: 'park' },
  { text: t('wifi.tags.metro'), value: 'metro' },
  { text: t('wifi.tags.bus'), value: 'bus' },
  { text: t('wifi.tags.train'), value: 'train' },
  { text: t('wifi.tags.museum'), value: 'museum' },
  { text: t('wifi.tags.hospital'), value: 'hospital' },
  { text: t('wifi.tags.university'), value: 'university' },
  { text: t('wifi.tags.coworking'), value: 'coworking' },
  { text: t('wifi.tags.free'), value: 'free' },
  { text: t('wifi.tags.fast'), value: 'fast' },
  { text: t('wifi.tags.secure'), value: 'secure' },
  { text: t('wifi.tags.public'), value: 'public' },
]

const sortOptions = [
  { text: t('wifi.distance'), value: 'distance' },
  { text: t('wifi.rating'), value: 'rating' },
  { text: t('common.createdAt'), value: 'createdAt' },
]

// Debounce для поиска
let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedEmit() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emitFilters()
  }, 500)
}

function emitFilters() {
  emit('update:modelValue', { ...localFilters })
}

function clearFilters() {
  localFilters.search = ''
  localFilters.connectionType = null
  localFilters.speed = null
  localFilters.tags = []
  localFilters.sortBy = 'distance'
  emitFilters()
}

async function useMyLocation() {
  if (!navigator.geolocation) {
    toast.error({
      title: t('common.error'),
      message: t('wifi.errors.locationUnavailable'),
      position: 'topRight',
      timeout: 3000,
    })
    return
  }

  gettingLocation.value = true

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })

    localFilters.lat = position.coords.latitude
    localFilters.lng = position.coords.longitude

    toast.success({
      title: t('common.success'),
      message: t('wifi.myLocation'),
      position: 'topRight',
      timeout: 2000,
    })

    emitFilters()
  } catch (error: any) {
    console.error('Geolocation error:', error)

    let errorMessage = t('wifi.errors.locationUnavailable')
    if (error.code === 1) {
      errorMessage = t('wifi.errors.locationDenied')
    }

    toast.error({
      title: t('common.error'),
      message: errorMessage,
      position: 'topRight',
      timeout: 3000,
    })
  } finally {
    gettingLocation.value = false
  }
}

// Синхронизация с внешними изменениями
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(localFilters, newValue)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.wifi-filters {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.wifi-filters::-webkit-scrollbar {
  width: 6px;
}

.wifi-filters::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.wifi-filters::-webkit-scrollbar-thumb {
  background: rgba(2, 136, 209, 0.3);
  border-radius: 3px;
}

.wifi-filters::-webkit-scrollbar-thumb:hover {
  background: rgba(2, 136, 209, 0.5);
}
</style>
