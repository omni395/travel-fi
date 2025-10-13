<template>
  <v-container
    fluid
    class="wifi-page pa-0"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <ClientOnly>
      <!-- Заголовок -->
      <v-row class="ma-0">
        <v-col cols="12" class="pa-3">
          <CustomCard class="header-card">
            <div class="d-flex justify-space-between align-center flex-wrap">
              <div>
                <h1 class="text-h5 text-white mb-1">
                  <v-icon size="28" class="mr-2">mdi-wifi</v-icon>
                  {{ t("wifi.title") }}
                </h1>
                <p class="text-body-2 text-white mb-0 opacity-90">
                  {{ t("wifi.subtitle") }}
                </p>
              </div>
              <CustomButton
                size="small"
                prepend-icon="mdi-plus-circle"
                @click="addDialog = true"
              >
                {{ t("wifi.addPoint") }}
              </CustomButton>
            </div>
          </CustomCard>
        </v-col>
      </v-row>


      <!-- Статистика (компактные карточки) -->
      <v-row class="ma-0 mb-2">
        <v-col cols="6" sm="3" class="pa-1">
          <CustomCard class="stats-card compact-stats-card">
            <div class="d-flex align-center ga-2">
              <v-icon size="22" color="primary">mdi-wifi-marker</v-icon>
              <div>
                <div class="text-h6 text-primary font-weight-bold">{{ stats.total }}</div>
                <div class="text-caption text-primary">{{ t("wifi.stats.total") }}</div>
              </div>
            </div>
          </CustomCard>
        </v-col>
        <v-col cols="6" sm="3" class="pa-1">
          <CustomCard class="stats-card compact-stats-card">
            <div class="d-flex align-center ga-2">
              <v-icon size="22" color="success">mdi-map-marker-radius</v-icon>
              <div>
                <div class="text-h6 text-success font-weight-bold">{{ stats.nearby }}</div>
                <div class="text-caption text-success">{{ t("wifi.stats.nearby") }}</div>
              </div>
            </div>
          </CustomCard>
        </v-col>
        <v-col cols="6" sm="3" class="pa-1">
          <CustomCard class="stats-card compact-stats-card">
            <div class="d-flex align-center ga-2">
              <v-icon size="22" color="amber">mdi-star</v-icon>
              <div>
                <div class="text-h6 text-amber font-weight-bold">{{ stats.avgRating.toFixed(1) }}</div>
                <div class="text-caption text-amber">{{ t("wifi.stats.avgRating") }}</div>
              </div>
            </div>
          </CustomCard>
        </v-col>
        <v-col cols="6" sm="3" class="pa-1">
          <CustomCard class="stats-card compact-stats-card">
            <div class="d-flex align-center ga-2">
              <v-icon size="22" color="purple">mdi-account-plus</v-icon>
              <div>
                <div class="text-h6 text-purple font-weight-bold">{{ stats.myContributions }}</div>
                <div class="text-caption text-purple">{{ t("wifi.stats.myContributions") }}</div>
              </div>
            </div>
          </CustomCard>
        </v-col>
      </v-row>

      <!-- Основной контент: карта и список -->
      <v-row class="ma-0">
        <!-- Фильтры (левая колонка на десктопе) -->
        <v-col cols="12" md="3" class="pa-2">
          <WifiFilters
            v-model="filters"
            @update:model-value="handleFilterChange"
          />
        </v-col>

        <!-- Карта и список -->
        <v-col cols="12" md="9" class="pa-2">
          <!-- Переключатель вид: карта/список -->
          <v-card class="mb-2" elevation="2">
            <v-card-text class="pa-3">
              <div class="d-flex justify-space-between align-center">
                <v-btn-toggle
                  v-model="viewMode"
                  color="primary"
                  mandatory
                  density="compact"
                >
                  <CustomButton value="map" size="small">
                    <v-icon start>mdi-map</v-icon>
                    {{ t("wifi.map") }}
                  </CustomButton>
                  <CustomButton value="list" size="small">
                    <v-icon start>mdi-view-list</v-icon>
                    {{ t("wifi.list") }}
                  </CustomButton>
                </v-btn-toggle>

                <div class="text-body-2 text-grey-darken-1">
                  {{ points.length }} {{ t("wifi.allPoints") }}
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Карта -->
          <v-card
            v-show="viewMode === 'map'"
            :style="{
              height: '600px',
              borderRadius: '12px',
              overflow: 'hidden',
            }"
            elevation="2"
          >
            <CustomMap
              :center="mapCenter"
              :zoom="mapZoom"
              :markers="mapMarkers"
              height="600px"
              @marker-click="handleMarkerClick"
              @marker-view="handleViewDetails"
            />
          </v-card>

          <!-- Список -->
          <div v-show="viewMode === 'list'">
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="primary"
              class="mb-2"
            />

            <div
              v-if="!loading && points.length === 0"
              class="text-center pa-8"
            >
              <v-card elevation="2">
                <v-card-text>
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">
                    mdi-wifi-off
                  </v-icon>
                  <h3 class="text-h6 text-grey-darken-1 mb-2">
                    {{ t("wifi.noResults") }}
                  </h3>
                  <p class="text-body-2 text-grey-darken-1 mb-4">
                    {{ t("wifi.clearFilters") }}
                  </p>
                  <CustomButton
                    color="primary"
                    prepend-icon="mdi-plus-circle"
                    @click="addDialog = true"
                  >
                    {{ t("wifi.addPoint") }}
                  </CustomButton>
                </v-card-text>
              </v-card>
            </div>

            <div v-else class="wifi-points-list">
              <WifiPointCard
                v-for="point in points"
                :key="point.id"
                :point="point"
                class="mb-3"
                @click="handlePointClick(point)"
                @view-details="handleViewDetails(point)"
                @show-on-map="handleShowOnMap(point)"
                @add-review="handleAddReview(point)"
              />

              <!-- Pagination -->
              <v-card v-if="totalPages > 1" class="mt-4" elevation="2">
                <v-card-text class="text-center">
                  <v-pagination
                    v-model="currentPage"
                    :length="totalPages"
                    :total-visible="7"
                    color="primary"
                    @update:model-value="loadWifiPoints"
                  />
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Диалог добавления точки -->
      <WifiAddDialog v-model="addDialog" @success="handlePointAdded" />

      <!-- Диалог редактирования точки -->
      <WifiAddDialog 
        v-model="editDialog" 
        :edit-mode="true" 
        :point-data="selectedPoint" 
        @success="handlePointEdited" 
      />

      <!-- Диалог деталей точки -->
      <WifiDetailDialog
        v-model="detailDialog"
        :point="selectedPoint"
        @add-review="handleAddReview"
        @report-security="handleReportSecurity"
        @edit-point="handleEditPoint"
        @delete-point="handleDeletePoint"
        @edit-review="handleEditReview"
        @delete-review="handleDeleteReview"
        @edit-security-report="handleEditSecurityReport"
        @delete-security-report="handleDeleteSecurityReport"
      />

      <!-- Диалог добавления отзыва -->
      <v-dialog v-model="reviewDialog" max-width="600" persistent>
        <v-card v-if="selectedPoint">
          <v-card-title class="bg-primary text-white">
            {{ editingReview ? (t("wifi.review.editTitle") || "Edit Review") : t("wifi.review.title") }}
          </v-card-title>

          <v-card-text class="pa-6">
            <h3 class="text-subtitle-1 mb-4">{{ selectedPoint.ssid }}</h3>

              <v-rating
                v-model="reviewForm.rating"
                :label="t('wifi.review.ratingLabel')"
                color="amber"
                size="large"
                hover
                class="mb-4"
                :rules="[(v) => !!v || t('wifi.review.ratingRequired')]"
                required
              />

              <v-textarea
                v-model="reviewForm.comment"
                :label="t('wifi.review.comment')"
                :placeholder="t('wifi.review.commentPlaceholder')"
                :hint="t('wifi.review.commentHint')"
                :counter="500"
                variant="outlined"
                rows="4"
                auto-grow
                :rules="[
                  (v) => !!v || t('wifi.review.commentRequired'),
                  (v) => (v && v.length >= 30) || t('wifi.review.commentMinLength')
                ]"
                required
              />
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <CustomButton
              variant="text"
              :disabled="submittingReview"
              @click="reviewDialog = false"
            >
              {{ t("wifi.review.cancel") }}
            </CustomButton>
              <CustomButton
                color="primary"
                :loading="submittingReview"
                :disabled="!reviewForm.rating || !reviewForm.comment || reviewForm.comment.length < 30"
                @click="submitReview"
              >
                {{ t("wifi.review.submit") }}
              </CustomButton>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Диалог отчета о безопасности -->
      <v-dialog v-model="securityDialog" max-width="600" persistent>
        <v-card v-if="selectedPoint">
          <v-card-title class="bg-primary text-white">
            {{ editingSecurityReport ? t("wifi.securityReport.editTitle") : t("wifi.securityReport.title") }}
          </v-card-title>

          <v-card-text class="pa-6">
            <h3 class="text-subtitle-1 mb-4">{{ selectedPoint.ssid }}</h3>
              <v-rating
                v-model="securityForm.rating"
                :label="t('wifi.review.ratingLabel')"
                color="amber"
                size="large"
                hover
                class="mb-4"
                :rules="[(v) => !!v || t('wifi.review.ratingRequired')]"
                required
              />

              <v-textarea
                v-model="securityForm.comment"
                :label="t('wifi.securityReport.comment')"
                :placeholder="t('wifi.securityReport.commentPlaceholder')"
                :hint="t('wifi.securityReport.commentHint')"
                :counter="500"
                :rules="[
                  (v) => !!v || t('wifi.securityReport.commentRequired'),
                  (v) => (v && v.length >= 30) || t('wifi.securityReport.commentMinLength')
                ]"
                variant="outlined"
                rows="4"
                auto-grow
                required
              />
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <CustomButton
              variant="text"
              :disabled="submittingSecurity"
              @click="securityDialog = false"
            >
              {{ t("wifi.securityReport.cancel") }}
            </CustomButton>
              <CustomButton
                color="warning"
                :loading="submittingSecurity"
                :disabled="!securityForm.rating || !securityForm.comment || securityForm.comment.length < 30"
                @click="submitSecurityReport"
              >
                {{ t("wifi.securityReport.submit") }}
              </CustomButton>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </ClientOnly>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useToast();
const localePath = useLocalePath()

// SEO
useHead({
  title: t("wifi.title"),
  meta: [{ name: "description", content: t("wifi.subtitle") }],
});

// Состояние
const loading = ref(false);
const viewMode = ref<"map" | "list">("map");
const points = ref<any[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 50;

const stats = reactive({
  total: 0,
  nearby: 0,
  avgRating: 0,
  myContributions: 0,
});

const filters = ref({
  search: "",
  lat: null as number | null,
  lng: null as number | null,
  // radius in meters; 0 = auto based on map zoom
  radius: 0,
  connectionType: null as string | null,
  speed: null as string | null,
  tags: [] as string[],
  sortBy: "distance",
});


// Диалоги и состояния
const addDialog = ref(false);
const editDialog = ref(false);
const detailDialog = ref(false);
const selectedPoint = ref<any>(null);
const reviewDialog = ref(false);
const reviewForm = reactive({ rating: 0, comment: "" });
const editingReview = ref<any>(null);
const securityDialog = ref(false);
const securityForm = reactive({ rating: 0, comment: "" });
const editingSecurityReport = ref<any>(null);
const submittingReview = ref(false);
const submittingSecurity = ref(false);

// Карта
const mapCenter = ref<[number, number]>([51.505, -0.09]);
const mapZoom = ref(13);
const mapMarkers = computed(() => {
  return points.value.map((point) => ({
    id: point.id,
    lat: point.lat,
    lng: point.lng,
    label: `${point.ssid} ${point.averageRating > 0 ? `⭐ ${point.averageRating.toFixed(1)}` : ""}`,
    distance: point.distance !== undefined ? (point.distance < 1 ? `${Math.round(point.distance * 1000)} m` : `${point.distance.toFixed(1)} km`) : undefined,
  }));
});

function handlePointClick(point: any) {
  handleViewDetails(point);
}

function handleFilterChange() {
  currentPage.value = 1;
  loadWifiPoints();
}

// convert map zoom to approximate radius in km when radius == 0
function zoomToKm(zoom: number) {
  if (!zoom) return 5;
  if (zoom >= 18) return 0.15;
  if (zoom === 17) return 0.3;
  if (zoom === 16) return 0.6;
  if (zoom === 15) return 1.2;
  if (zoom === 14) return 2.5;
  return 5;
}

async function loadWifiPoints() {
  loading.value = true;
  try {
    const params: any = {
      limit,
      offset: (currentPage.value - 1) * limit,
      status: "approved",
    };
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.lat && filters.value.lng) {
      params.lat = filters.value.lat;
      params.lng = filters.value.lng;
      // convert meters to km for API
      let radiusKm = 0;
      if (filters.value.radius && Number(filters.value.radius) > 0) {
        radiusKm = Number(filters.value.radius) / 1000;
      } else {
        radiusKm = zoomToKm(mapZoom.value);
      }
      params.radius = radiusKm;
    }
    if (filters.value.connectionType) params.connectionType = filters.value.connectionType;
    if (filters.value.speed) params.speed = filters.value.speed;
    if (filters.value.tags.length > 0) params.tags = filters.value.tags.join(",");

  const response: any = await $fetch("/api/wifi", { method: "GET", params });
    if (response.success && response.data) {
      points.value = response.data.points;
      stats.total = response.data.total;
      stats.nearby = points.value.length;
      stats.avgRating = points.value.length > 0 ? points.value.reduce((sum, p) => sum + p.averageRating, 0) / points.value.length : 0;
      totalPages.value = Math.ceil(response.data.total / limit);
      if (points.value.length > 0 && !filters.value.lat) {
        mapCenter.value = [points.value[0].lat, points.value[0].lng];
      } else if (filters.value.lat && filters.value.lng) {
        mapCenter.value = [filters.value.lat, filters.value.lng];
      }
    }
  } catch (error: any) {
    console.error("Error loading Wi-Fi points:", error);
    toast.error({ title: t("common.error"), message: t("wifi.errors.loadFailed"), position: "topRight", timeout: 3000 });
  } finally {
    loading.value = false;
  }
}

async function loadUserStats() {
  try {
    const { user } = useUser();
    if (user.value) {
      stats.myContributions = user.value.points || 0;
    }
  } catch (error) {
    console.error("Error loading user stats:", error);
  }
}
// Вызываем загрузку данных при монтировании (клиент)
onMounted(async () => {
  try {
    // Try to center map on user's location first
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 })
        })
        mapCenter.value = [pos.coords.latitude, pos.coords.longitude]
      } catch (e) {
        // ignore
      }
    }
    await loadWifiPoints();
    await loadUserStats();
  } catch (e) {
    console.error("Error during initial load:", e);
  }
});

function handleViewDetails(point: any) {
  $fetch(`/api/wifi/${point.id}`, { method: "GET" })
    .then((response: any) => {
      if (response.success) {
        selectedPoint.value = response.data;
        detailDialog.value = true;
      }
    })
    .catch((error: any) => {
      console.error("Error loading point details:", error);
      toast.error({
        title: t("common.error"),
        message: t("wifi.errors.loadFailed"),
        position: "topRight",
        timeout: 3000,
      });
    });
}

function handleShowOnMap(point: any) {
  viewMode.value = "map";
  mapCenter.value = [point.lat, point.lng];
  if (mapZoom.value < 14) {
    mapZoom.value = 16;
  }
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
}

function handleAddReview(point: any) {
  selectedPoint.value = point;
  editingReview.value = null;
  reviewForm.rating = 0;
  reviewForm.comment = "";
  reviewDialog.value = true;
  detailDialog.value = false;
}

function handleEditReview(review: any) {
  editingReview.value = review;
  reviewForm.rating = review.rating;
  reviewForm.comment = review.comment || "";
  reviewDialog.value = true;
  detailDialog.value = false;
}

async function handleDeleteReview(review: any) {
  if (!confirm(t("wifi.confirmDeleteReview") || "Are you sure you want to delete this review?")) {
    return;
  }

  try {
    const csrfResponse: any = await $fetch("/api/csrf", { method: "GET", credentials: 'include' });
    const csrfToken = csrfResponse.csrf;

    await $fetch(`/api/wifi/${selectedPoint.value.id}/review/${review.id}`, {
      method: "DELETE",
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken },
      body: { _csrf: csrfToken },
    });

    toast.success({
      title: t("common.success"),
      message: t("wifi.reviewDeleted") || "Review deleted successfully",
      position: "topRight",
      timeout: 3000,
    });

    await loadWifiPoints();
    // Жёстко обновляем точку и диалог
    await fetchPointById(selectedPoint.value.id)
    nextTick(() => { detailDialog.value = true })
  } catch (error: any) {
    console.error("Error deleting review:", error);
    toast.error({
      title: t("common.error"),
      message: error.statusMessage || t("wifi.deleteFailed") || "Failed to delete review",
      position: "topRight",
      timeout: 3000,
    });
  }
}

function handleReportSecurity(point: any) {
  selectedPoint.value = point;
  editingSecurityReport.value = null;
  securityForm.rating = 0;
  securityForm.risks = "";
  securityDialog.value = true;
  detailDialog.value = false;
}

function handleEditSecurityReport(report: any) {
  editingSecurityReport.value = report;
  securityForm.rating = report.rating || 0;
  securityForm.risks = report.risks || "";
  securityDialog.value = true;
  detailDialog.value = false;
}

async function handleDeleteSecurityReport(report: any) {
  if (!confirm(t("wifi.confirmDeleteSecurityReport") || "Are you sure you want to delete this security report?")) {
    return;
  }

  try {
    const csrfResponse: any = await $fetch("/api/csrf", { method: "GET", credentials: 'include' });
    const csrfToken = csrfResponse.csrf;

    await $fetch(`/api/wifi/${selectedPoint.value.id}/security-report/${report.id}`, {
      method: "DELETE",
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken },
      body: { _csrf: csrfToken },
    });

    toast.success({
      title: t("common.success"),
      message: t("wifi.securityReportDeleted") || "Security report deleted successfully",
      position: "topRight",
      timeout: 3000,
    });

    await loadWifiPoints();
    // Жёстко обновляем точку и диалог
    await fetchPointById(selectedPoint.value.id)
    nextTick(() => { detailDialog.value = true })
  } catch (error: any) {
    console.error("Error deleting security report:", error);
    toast.error({
      title: t("common.error"),
      message: error.statusMessage || t("wifi.deleteFailed") || "Failed to delete security report",
      position: "topRight",
      timeout: 3000,
    });
  }
}

function handleMarkerClick(marker: any) {
  // Keep default behaviour: open popup is handled by CustomMap
  // Center map on the marker and don't auto-open full details
  const point = points.value.find((p) => p.id === marker.id);
  if (point) {
    mapCenter.value = [point.lat, point.lng];
    if (mapZoom.value < 14) mapZoom.value = 15;
  }
}

// Жёсткий fetch точки по ID
async function fetchPointById(id: number) {
  try {
    const resp: any = await $fetch(`/api/wifi/${id}`, { method: 'GET' })
    if (resp.success && resp.data) {
      selectedPoint.value = resp.data
    }
  } catch (e) {
    console.error('Ошибка загрузки точки', e)
  }
}

// Отправка отзыва (простая реализация, при наличии API будет работать)
async function submitReview() {
  if (!selectedPoint.value) return;
  submittingReview.value = true;
  try {
    // Get fresh CSRF token for POST
    const csrfResp: any = await $fetch('/api/csrf', { method: 'GET', credentials: 'include' })
    const csrfToken = csrfResp?.csrf
    const payload = { ...reviewForm, _csrf: csrfToken }
    
    // Если редактируем существующий отзыв
    if (editingReview.value) {
      await $fetch(`/api/wifi/${selectedPoint.value.id}/review/${editingReview.value.id}`, {
        method: "PATCH",
        body: payload,
        credentials: "include",
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken 
        },
      });
      toast.success({ title: t("common.success"), message: t("wifi.review.updated") || "Review updated successfully", position: "topRight" });
    } else {
      // Создаём новый отзыв
      await $fetch(`/api/wifi/${selectedPoint.value.id}/review`, {
        method: "POST",
        body: payload,
        credentials: "include",
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken 
        },
      });
      toast.success({ title: t("common.success"), message: t("wifi.review.thanks"), position: "topRight" });
    }
    
    reviewDialog.value = false;
    editingReview.value = null;
    
    // Жёстко обновляем точку и диалог
    await fetchPointById(selectedPoint.value.id)
    await loadWifiPoints()
    nextTick(() => { detailDialog.value = true })
  } catch (error: any) {
    console.error("Error submitting review:", error);
    
    if (error.statusCode === 400 && error.statusMessage?.includes('inappropriate')) {
      toast.error({ 
        title: t("common.error"), 
        message: t("wifi.review.inappropriateContent") || "Содержимое содержит недопустимую лексику. Пожалуйста, измените текст и попробуйте снова.",
        position: "topRight" 
      });
    } else {
      toast.error({ 
        title: t("common.error"), 
        message: t("wifi.review.failed"), 
        position: "topRight" 
      });
    }
  } finally {
    submittingReview.value = false;
  }
}

// Отправка отчёта о безопасности
async function submitSecurityReport() {
  if (!selectedPoint.value) return;
  
  submittingSecurity.value = true;
  
  try {
    // Get fresh CSRF token for POST
    const csrfResp: any = await $fetch('/api/csrf', { method: 'GET', credentials: 'include' });
    const csrfToken = csrfResp?.csrf;
    const payload = { ...securityForm, _csrf: csrfToken };
    if (editingSecurityReport.value) {
      await $fetch(`/api/wifi/${selectedPoint.value.id}/security-report/${editingSecurityReport.value.id}`, {
        method: "PATCH",
        body: payload,
        credentials: "include",
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken 
        },
      });
      toast.success({ title: t("common.success"), message: t("wifi.securityReport.updated") || "Security report updated successfully", position: "topRight" });
    } else {
      await $fetch(`/api/wifi/${selectedPoint.value.id}/security-report`, {
        method: "POST",
        body: payload,
        credentials: "include",
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken 
        },
      });
      toast.success({ title: t("common.success"), message: t("wifi.securityReport.thanks"), position: "topRight" });
    }
    // Жёстко обновляем точку и диалог
    securityDialog.value = false;
    editingSecurityReport.value = null;
    await fetchPointById(selectedPoint.value.id)
    await loadWifiPoints()
    nextTick(() => { detailDialog.value = true })
  } catch (error: any) {
    console.error("Error submitting security report:", error);
    
    if (error.statusCode === 400 && error.statusMessage?.includes('inappropriate')) {
      toast.error({ 
        title: t("common.error"), 
        message: t("wifi.securityReport.inappropriateContent") || "Содержимое содержит недопустимую лексику. Пожалуйста, измените текст и попробуйте снова.",
        position: "topRight" 
      });
    } else {
      toast.error({ 
        title: t("common.error"), 
        message: t("wifi.securityReport.failed"), 
        position: "topRight" 
      });
    }
  } finally {
    submittingSecurity.value = false;
  }
}

async function handlePointAdded(point: any) {
  try {
    // Do not show pending points in the public list/map. Reload approved points.
    await loadWifiPoints();
  } catch (e) {
    await loadWifiPoints();
  }
  loadUserStats();
}

function handleEditPoint(point: any) {
  selectedPoint.value = point;
  detailDialog.value = false;
  editDialog.value = true;
}

async function handlePointEdited(updatedPoint: any) {
  toast.success({
    title: t("common.success"),
    message: t("wifi.pointUpdated") || "Wi-Fi point updated successfully",
    position: "topRight",
    timeout: 3000,
  });
  await loadWifiPoints();
  await fetchPointById(updatedPoint.id)
  nextTick(() => { detailDialog.value = true })
  loadUserStats();
}

async function handleDeletePoint(point: any) {
  if (!confirm(t("wifi.confirmDelete") || "Are you sure you want to delete this Wi-Fi point?")) {
    return;
  }

  try {
    // Получаем CSRF токен
    const csrfResponse: any = await $fetch("/api/csrf", { method: "GET", credentials: 'include' });
    const csrfToken = csrfResponse.csrf;

    await $fetch(`/api/wifi/${point.id}`, {
      method: "DELETE",
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken },
      body: { _csrf: csrfToken },
    });

    toast.success({
      title: t("common.success"),
      message: t("wifi.pointDeleted") || "Wi-Fi point deleted successfully",
      position: "topRight",
      timeout: 3000,
    });

    detailDialog.value = false;
    await loadWifiPoints();
    loadUserStats();
  } catch (error: any) {
    console.error("Error deleting Wi-Fi point:", error);
    toast.error({
      title: t("common.error"),
      message: error.statusMessage || t("wifi.deleteFailed") || "Failed to delete Wi-Fi point",
      position: "topRight",
      timeout: 3000,
    });
  }
}

// ...existing code...
</script>

<style scoped>
.wifi-page {
  min-height: calc(100vh - 64px);
}

.header-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.1) 100%
  ) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}


.stats-card {
  background: rgba(255,255,255,0.12) !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
  box-shadow: none;
  padding: 8px 8px !important;
}

.compact-stats-card {
  min-height: 64px;
  padding: 8px 8px !important;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.stats-card:hover {
  box-shadow: 0 4px 12px rgba(2, 136, 209, 0.12) !important;
  background: rgba(255,255,255,0.18) !important;
}

.opacity-90 {
  opacity: 0.9;
}

.wifi-points-list {
  max-height: 800px;
  overflow-y: auto;
}

.wifi-points-list::-webkit-scrollbar {
  width: 8px;
}

.wifi-points-list::-webkit-scrollbar-track {
  background: rgba(2, 136, 209, 0.05);
  border-radius: 4px;
}

.wifi-points-list::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    rgba(2, 136, 209, 0.3) 0%,
    rgba(2, 136, 209, 0.5) 100%
  );
  border-radius: 4px;
}

.wifi-points-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    rgba(2, 136, 209, 0.5) 0%,
    rgba(2, 136, 209, 0.7) 100%
  );
}
</style>
