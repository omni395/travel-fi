<template>
  <v-dialog v-model="localDialog" max-width="900" persistent scrollable>
    <v-card>
      <v-card-title
        class="d-flex justify-space-between align-center bg-primary"
      >
        <span class="text-white">{{ props.editMode ? (t("wifi.form.editTitle") || "Edit Wi-Fi Point") : t("wifi.form.title") }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <!-- Карта для выбора местоположения -->
          <div class="mb-4">
            <label class="text-subtitle-2 text-grey-darken-2 mb-2 d-block">
              {{ t("wifi.form.location") }} <span class="text-error">*</span>
            </label>
            <p class="text-caption text-grey-darken-1 mb-2">
              {{ t("wifi.form.clickMap") }}
            </p>
            <div
              class="map-container"
              :style="{
                height: '300px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid',
                borderColor:
                  form.lat && form.lng
                    ? 'rgb(var(--v-theme-success))'
                    : 'rgb(var(--v-theme-grey-lighten-2))',
              }"
            >
              <ClientOnly>
                <CustomMap
                  :center="mapCenter"
                  :zoom="13"
                  :markers="markers"
                  height="300px"
                  @click="handleMapClick"
                  @marker-view="onExistingMarkerView"
                />
              </ClientOnly>
            </div>
            <div
              v-if="form.lat && form.lng"
              class="text-caption text-success mt-1"
            >
              <v-icon size="16">mdi-check-circle</v-icon>
              {{ form.lat.toFixed(6) }}, {{ form.lng.toFixed(6) }}
            </div>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <!-- Имя сети (SSID) -->
              <v-text-field
                v-model="form.ssid"
                :label="t('wifi.form.ssid')"
                :placeholder="t('wifi.form.ssidPlaceholder')"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-wifi"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- Пароль (опционально) -->
              <v-text-field
                v-model="form.password"
                :label="t('wifi.form.password')"
                :placeholder="t('wifi.form.passwordPlaceholder')"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="comfortable"
                @click:append-inner="showPassword = !showPassword"
                @update:model-value="handlePasswordChange"
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- Тип подключения -->
              <v-select
                v-model="form.connectionType"
                :label="t('wifi.form.connectionType')"
                :items="connectionTypes"
                item-title="text"
                item-value="value"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-connection"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- Скорость (опционально) -->
              <v-select
                v-model="form.speed"
                :label="t('wifi.form.speedOptional')"
                :items="speedOptions"
                item-title="text"
                item-value="value"
                prepend-inner-icon="mdi-speedometer"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <!-- Теги -->
              <v-autocomplete
                v-model="form.tags"
                :label="t('wifi.form.tags')"
                :placeholder="t('wifi.form.tagsPlaceholder')"
                :items="availableTags"
                item-title="text"
                item-value="value"
                :rules="[rules.tagsRequired]"
                prepend-inner-icon="mdi-tag-multiple"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
                required
              />
            </v-col>

            <v-col cols="12">
              <!-- Описание (опционально) -->
              <v-textarea
                v-model="form.description"
                :label="t('wifi.form.description')"
                :placeholder="t('wifi.form.descriptionPlaceholder')"
                :hint="t('wifi.form.descriptionHint')"
                :counter="500"
                :rules="[rules.maxLength(500)]"
                prepend-inner-icon="mdi-text"
                variant="outlined"
                density="comfortable"
                rows="3"
                auto-grow
              />
            </v-col>
          </v-row>

          <!-- Предупреждение об AI проверке -->
          <v-alert
            v-if="form.description && form.description.trim().length > 0"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            <v-icon start>mdi-robot</v-icon>
            {{ t("wifi.form.descriptionHint") }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          color="grey-darken-1"
          :disabled="submitting"
          @click="closeDialog"
        >
          {{ t("wifi.form.cancel") }}
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          :loading="submitting"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ props.editMode ? (t("wifi.form.update") || "Update") : t("wifi.form.submit") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useToast();

const props = defineProps<{
  modelValue: boolean;
  editMode?: boolean;
  pointData?: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success", point: any): void;
}>();

const localDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formRef = ref<any>(null);
const submitting = ref(false);
const showPassword = ref(false);

const form = reactive({
  lat: null as number | null,
  lng: null as number | null,
  ssid: "",
  password: "",
  connectionType: "Free",
  speed: null as string | null,
  tags: [] as string[],
  description: "",
});

const mapCenter = ref<[number, number]>([51.505, -0.09]);

// Approved nearby points to display on add dialog map
const approvedNearby = ref<any[]>([])

const markers = computed(() => {
  const out: any[] = []
  // existing approved points
  approvedNearby.value.forEach(p => {
    out.push({ id: `a-${p.id}`, lat: p.lat, lng: p.lng, label: p.ssid, distance: p.distance })
  })

  // user's current selection
  if (form.lat && form.lng) {
    out.unshift({ id: 'new', lat: form.lat, lng: form.lng, label: form.ssid || t('wifi.form.location') })
  }

  return out
})

async function loadApprovedNearby(radiusMeters = 500) {
  // radiusMeters -> km for API
  try {
    const rKm = Math.max(0.05, radiusMeters / 1000)
    const params: any = { limit: 200, status: 'approved' }
    if (mapCenter.value) {
      params.lat = mapCenter.value[0]
      params.lng = mapCenter.value[1]
      params.radius = rKm
    }
    const resp: any = await $fetch('/api/wifi', { method: 'GET', params })
    if (resp?.success && resp.data?.points) {
      approvedNearby.value = resp.data.points
    }
  } catch (err) {
    console.warn('Failed to load nearby approved points', err)
  }
}

const connectionTypes = [
  { text: t("wifi.form.free"), value: "Free" },
  { text: t("wifi.form.paid"), value: "Paid" },
  { text: t("wifi.form.passwordProtected"), value: "Password-Protected" },
];

const speedOptions = [
  { text: t("wifi.form.fast"), value: "Fast" },
  { text: t("wifi.form.medium"), value: "Medium" },
  { text: t("wifi.form.slow"), value: "Slow" },
];

const availableTags = [
  { text: t("wifi.tags.cafe"), value: "cafe" },
  { text: t("wifi.tags.restaurant"), value: "restaurant" },
  { text: t("wifi.tags.hotel"), value: "hotel" },
  { text: t("wifi.tags.airport"), value: "airport" },
  { text: t("wifi.tags.mall"), value: "mall" },
  { text: t("wifi.tags.library"), value: "library" },
  { text: t("wifi.tags.park"), value: "park" },
  { text: t("wifi.tags.metro"), value: "metro" },
  { text: t("wifi.tags.bus"), value: "bus" },
  { text: t("wifi.tags.train"), value: "train" },
  { text: t("wifi.tags.museum"), value: "museum" },
  { text: t("wifi.tags.hospital"), value: "hospital" },
  { text: t("wifi.tags.university"), value: "university" },
  { text: t("wifi.tags.coworking"), value: "coworking" },
  { text: t("wifi.tags.free"), value: "free" },
  { text: t("wifi.tags.fast"), value: "fast" },
  { text: t("wifi.tags.secure"), value: "secure" },
  { text: t("wifi.tags.public"), value: "public" },
];

const rules = {
  required: (v: any) => !!v || t("wifi.form.required"),
  tagsRequired: (v: any[]) => (v && v.length > 0) || t("wifi.form.required"),
  maxLength: (max: number) => (v: string) =>
    !v || v.length <= max || `Max ${max} characters`,
};

const isFormValid = computed(() => {
  return (
    form.lat !== null &&
    form.lng !== null &&
    form.ssid.trim().length > 0 &&
    form.tags.length > 0 &&
    form.connectionType !== null
  );
});

function handlePasswordChange(value: string) {
  // Автоматически устанавливаем тип подключения на основе пароля
  if (value && value.trim().length > 0) {
    // Если есть пароль - это "Password-Protected"
    form.connectionType = "Password-Protected";
  } else if (form.connectionType === "Password-Protected") {
    // Если пароль удалили, а тип был "Password-Protected" - меняем на "Free"
    form.connectionType = "Free";
  }
}

function handleMapClick(event: any) {
  // Получаем координаты клика на карте
  if (event.latlng) {
    form.lat = event.latlng.lat;
    form.lng = event.latlng.lng;
    mapCenter.value = [event.latlng.lat, event.latlng.lng];
  }
}

async function handleSubmit() {
  if (!isFormValid.value) {
    toast.error({
      title: t("common.error"),
      message: t("wifi.form.selectLocation"),
      position: "topRight",
      timeout: 3000,
    });
    return;
  }

  submitting.value = true;

  try {
    // Получаем CSRF токен
  const csrfResponse = await $fetch("/api/csrf", { method: "GET", credentials: 'include' });
  const csrfToken = csrfResponse.csrf;

    // Подготавливаем данные
    const payload = {
      lat: form.lat,
      lng: form.lng,
      ssid: form.ssid.trim(),
      password: form.password.trim() || null,
      connectionType: form.connectionType,
      speed: form.speed,
      tags: form.tags,
      description: form.description.trim() || null,
      _csrf: csrfToken,
    };

    // Отправляем запрос (POST для создания, PATCH для обновления)
    // Используем пользовательский API, а не админский
    const url = props.editMode && props.pointData?.id 
      ? `/api/wifi/${props.pointData.id}/update`
      : "/api/wifi";
    const method = props.editMode ? "PATCH" : "POST";
    
    const resp: any = await $fetch(url, {
      method,
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken },
      body: payload,
    });
    if (resp && resp.success) {
      // Показываем сообщение успеха
      toast.success({
        title: t("common.success"), 
        message: resp.data?.message || t("wifi.pointAddedPending"),
        position: "topRight",
        timeout: 3000
      });

      // Показываем заработанные баллы (если есть)
      if (resp?.data?.pointsEarned) {
        setTimeout(() => {
          toast.info({
            title:
              "🎉 " +
              t("wifi.review.pointsEarned", {
                points: resp.data.pointsEarned,
              }),
            position: "topRight",
            timeout: 3000,
          });
        }, 500);
      }

      if (resp.data && resp.data.point) {
        emit("success", resp.data.point);
      } else {
        emit("success", null);
      }
      closeDialog();
      resetForm();
    }
  } catch (error: any) {
    console.error("Error adding Wi-Fi point:", error);
    // Если сервер требует завершения профиля — редирект на страницу профиля
    if (
      error?.statusMessage === 'complete_profile' ||
      error?.message === 'complete_profile' ||
      (error?.statusCode === 403 && (error?.data === 'complete_profile' || error?.statusMessage === 'complete_profile'))
    ) {
      toast.error({
        title: t('common.error'),
        message: t('wifi.errors.completeProfile') || 'Пожалуйста, заполните профиль (подтвердите email и укажите имя).',
        position: 'topRight',
        timeout: 4000,
      });
      // Явный редирект на страницу профиля
      const localePath = useLocalePath();
      setTimeout(() => {
        navigateTo(localePath('/profile'));
      }, 500);
      return;
    }

    let errorMessage = t("wifi.errors.addFailed");

    if (error.statusCode === 409) {
      errorMessage = t("wifi.form.duplicate");
    } else if (error.statusCode === 400) {
      if (error.statusMessage?.includes("inappropriate")) {
        errorMessage = t("wifi.form.toxicContent");
      } else {
        errorMessage = error.statusMessage || errorMessage;
      }
    }

    toast.error({
      title: t("common.error"),
      message: errorMessage,
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    submitting.value = false;
  }
}

function closeDialog() {
  localDialog.value = false;
}

function resetForm() {
  form.lat = null;
  form.lng = null;
  form.ssid = "";
  form.password = "";
  form.connectionType = "Free";
  form.speed = null;
  form.tags = [];
  form.description = "";
  mapCenter.value = [51.505, -0.09];
}

// Пытаемся получить текущую локацию пользователя при открытии диалога
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue) {
      // Если режим редактирования - загружаем данные точки
      if (props.editMode && props.pointData) {
        form.lat = props.pointData.lat;
        form.lng = props.pointData.lng;
        form.ssid = props.pointData.ssid || "";
        form.password = props.pointData.password || "";
        form.connectionType = props.pointData.connectionType || "Free";
        form.speed = props.pointData.speed || null;
        form.tags = props.pointData.tags || [];
        form.description = props.pointData.description || "";
        mapCenter.value = [props.pointData.lat, props.pointData.lng];
        loadApprovedNearby(500);
      } else if (!form.lat && !form.lng) {
        // Режим создания - пытаемся получить геолокацию
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: false,
                  timeout: 5000,
                  maximumAge: 60000,
                });
              },
            );

            mapCenter.value = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            // load nearby approved points around user
            loadApprovedNearby(500)
          } catch (error) {
            // Игнорируем ошибку, пользователь может выбрать местоположение вручную
            console.log("Could not get user location:", error);
          }
        }
      }
    }
  },
);

// Also reload nearby approved when map center changes (user clicks)
watch(() => mapCenter.value, (nv) => {
  if (nv) loadApprovedNearby(500)
}, { deep: true })

function onExistingMarkerView(marker: any) {
  // Inform the user that this point already exists and center map on it
  mapCenter.value = [marker.lat, marker.lng]
  useToast().info({ title: t('wifi.exists.title') || 'Exists', message: t('wifi.exists.message', { ssid: marker.label }) || `Point ${marker.label} already exists`, position: 'topRight', timeout: 3000 })
}
</script>

<style scoped>
.map-container {
  position: relative;
  cursor: crosshair;
}

:deep(.v-input__details) {
  padding-inline-start: 0 !important;
}
</style>
