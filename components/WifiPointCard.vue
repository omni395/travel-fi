<template>
  <v-card
    class="wifi-point-card"
    elevation="2"
    hover
    @click="$emit('click', point)"
  >
    <v-card-text class="pa-3">
      <div class="d-flex justify-space-between align-start mb-2">
        <div class="flex-grow-1">
          <div class="d-flex align-center mb-1">
            <v-icon
              :color="getConnectionTypeColor(point.connectionType)"
              size="18"
              class="mr-2"
            >
              {{ getConnectionTypeIcon(point.connectionType) }}
            </v-icon>
            <h3 class="text-subtitle-1 text-primary mb-0 font-weight-bold">
              {{ point.ssid }}
            </h3>
          </div>

          <div class="d-flex align-center flex-wrap gap-2 mb-2">
            <v-chip
              v-if="point.distance !== undefined"
              size="small"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-map-marker-distance"
            >
              {{ formatDistance(point.distance) }}
            </v-chip>

            <v-chip
              v-if="point.averageRating > 0"
              size="small"
              color="amber"
              variant="tonal"
              prepend-icon="mdi-star"
            >
              {{ point.averageRating.toFixed(1) }} ({{ point.reviewCount }})
            </v-chip>

            <v-chip
              v-if="point.speed"
              size="small"
              :color="getSpeedColor(point.speed)"
              variant="tonal"
            >
              {{ t(`wifi.form.${point.speed.toLowerCase()}`) }}
            </v-chip>
          </div>
        </div>

        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
              v-bind="props"
              @click.stop
            />
          </template>
          <v-list>
            <v-list-item @click.stop="$emit('view-details', point)">
              <template #prepend>
                <v-icon>mdi-information</v-icon>
              </template>
              <v-list-item-title>{{ t("wifi.viewDetails") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="$emit('show-on-map', point)">
              <template #prepend>
                <v-icon>mdi-map-marker</v-icon>
              </template>
              <v-list-item-title>{{ t("wifi.showOnMap") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="$emit('add-review', point)">
              <template #prepend>
                <v-icon>mdi-star-plus</v-icon>
              </template>
              <v-list-item-title>{{ t("wifi.addReview") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div
        v-if="point.description"
        class="text-caption text-grey-darken-2 mb-2"
      >
        {{ truncateDescription(point.description, 100) }}
      </div>

      <div class="d-flex flex-wrap gap-1 mb-3">
        <v-chip
          v-for="tag in point.tags.slice(0, 4)"
          :key="tag"
          size="x-small"
          variant="outlined"
          color="primary"
        >
          {{ t(`wifi.tags.${tag}`) || tag }}
        </v-chip>
        <v-chip
          v-if="point.tags.length > 4"
          size="x-small"
          variant="text"
          color="primary"
        >
          +{{ point.tags.length - 4 }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-avatar size="24" class="mr-2">
            <v-img
              v-if="point.user?.profilePicture"
              :src="point.user.profilePicture"
              :alt="point.user.name || 'User'"
            />
            <v-icon v-else size="16">mdi-account</v-icon>
          </v-avatar>
          <span class="text-caption text-grey-darken-1">
            {{ point.user?.name || t("common.anonymous") }}
          </span>
        </div>

        <div class="d-flex align-center gap-2">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                size="small"
                :color="getSecurityColor(point.securityReportCount)"
                variant="tonal"
                prepend-icon="mdi-shield-check"
              >
                {{ getSecurityScore(point.securityReportCount) }}
              </v-chip>
            </template>
            <span>{{ t("wifi.detail.securityScore") }}</span>
          </v-tooltip>

          <v-chip
            v-if="point.password"
            size="small"
            color="warning"
            variant="tonal"
          >
            <v-icon size="16" start>mdi-lock</v-icon>
            {{ t("wifi.detail.passwordAvailable") }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface WifiPoint {
  id: number;
  ssid: string;
  lat: number;
  lng: number;
  password?: string | null;
  tags: string[];
  connectionType: string;
  speed?: string | null;
  description?: string | null;
  status: string;
  distance?: number;
  averageRating: number;
  reviewCount: number;
  securityReportCount: number;
  user?: {
    id: number;
    name?: string | null;
    profilePicture?: string | null;
    badges: string[];
  };
  createdAt: string;
}

defineProps<{
  point: WifiPoint;
}>();

defineEmits<{
  (e: "click", point: WifiPoint): void;
  (e: "view-details", point: WifiPoint): void;
  (e: "show-on-map", point: WifiPoint): void;
  (e: "add-review", point: WifiPoint): void;
}>();

function getConnectionTypeIcon(type: string): string {
  switch (type) {
    case "Free":
      return "mdi-wifi";
    case "Paid":
      return "mdi-currency-usd";
    case "Password-Protected":
      return "mdi-wifi-lock";
    default:
      return "mdi-wifi";
  }
}

function getConnectionTypeColor(type: string): string {
  switch (type) {
    case "Free":
      return "success";
    case "Paid":
      return "warning";
    case "Password-Protected":
      return "info";
    default:
      return "grey";
  }
}

function getSpeedColor(speed: string): string {
  switch (speed) {
    case "Fast":
      return "success";
    case "Medium":
      return "warning";
    case "Slow":
      return "error";
    default:
      return "grey";
  }
}

function getSecurityColor(reportCount: number): string {
  if (reportCount === 0) return "success";
  if (reportCount <= 2) return "warning";
  return "error";
}

function getSecurityScore(reportCount: number): number {
  return Math.max(0, 100 - reportCount * 10);
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

function truncateDescription(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
</script>

<style scoped>
.wifi-point-card {
  cursor: pointer;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 1) 100%
  ) !important;
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(2, 136, 209, 0.1);
}

.wifi-point-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(2, 136, 209, 0.2) !important;
  border-color: rgba(2, 136, 209, 0.3);
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>
