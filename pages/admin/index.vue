<template>
  <v-container fluid class="admin-dashboard">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h3 font-weight-bold mb-2">
              {{ t("admin.dashboard") }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              {{ t("admin.welcomeBack", { name: user?.name || user?.email }) }}
            </p>
          </div>
          <v-chip
            :color="user?.role === 'admin' ? 'error' : 'warning'"
            variant="elevated"
            size="large"
          >
            <v-icon start>mdi-shield-crown</v-icon>
            {{
              user?.role === "admin" ? t("admin.admin") : t("admin.moderator")
            }}
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Статистика -->
      <v-col cols="12" md="3">
        <v-card class="stat-card" color="primary" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h4 font-weight-bold">1,234</div>
            <div class="text-caption">{{ t("admin.totalUsers") }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card" color="secondary" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-wifi</v-icon>
            <div class="text-h4 font-weight-bold">567</div>
            <div class="text-caption">{{ t("admin.wifiPoints") }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card" color="accent" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-sim</v-icon>
            <div class="text-h4 font-weight-bold">89</div>
            <div class="text-caption">{{ t("admin.esimTariffs") }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stat-card" color="warning" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-alert-circle</v-icon>
            <div class="text-h4 font-weight-bold">12</div>
            <div class="text-caption">{{ t("admin.pendingReports") }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- Быстрые действия -->
      <v-col cols="12" md="6">
        <v-card variant="elevated">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-flash</v-icon>
            {{ t("admin.quickActions") }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                prepend-icon="mdi-account-multiple"
                :title="t('admin.manageUsers')"
                :subtitle="t('admin.manageUsersDesc')"
                @click="navigateTo('/admin/users')"
              />
              <v-list-item
                prepend-icon="mdi-wifi"
                :title="t('admin.moderateWifi')"
                :subtitle="t('admin.moderateWifiDesc')"
                @click="navigateTo('/admin/wifi')"
              />
              <v-list-item
                prepend-icon="mdi-sim"
                :title="t('admin.manageEsim')"
                :subtitle="t('admin.manageEsimDesc')"
                @click="navigateTo('/admin/esim')"
              />
              <v-list-item
                prepend-icon="mdi-flag"
                :title="t('admin.reviewReports')"
                :subtitle="t('admin.reviewReportsDesc')"
                @click="navigateTo('/admin/reports')"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Последние действия -->
      <v-col cols="12" md="6">
        <v-card variant="elevated">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-history</v-icon>
            {{ t("admin.recentActivity") }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :prepend-icon="activity.icon"
              >
                <v-list-item-title>{{ activity.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ activity.time }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- График активности -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card variant="elevated">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            {{ t("admin.activityChart") }}
          </v-card-title>
          <v-card-text>
            <div class="chart-placeholder text-center py-8">
              <v-icon size="64" color="grey">mdi-chart-areaspline</v-icon>
              <p class="text-grey mt-4">{{ t("admin.chartPlaceholder") }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

// Проверка доступа только для админов/модераторов
definePageMeta({
  middleware: "auth",
  layout: "default",
});

const { t } = useI18n();
const { user, loggedIn, isAdmin } = useUser();

// Проверяем роль пользователя
if (!user.value || !isAdmin.value) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access Forbidden",
  });
}

// Мокированные данные для последних действий
const recentActivities = computed(() => [
  {
    id: 1,
    icon: "mdi-wifi-plus",
    title: t("admin.newWifiAdded"),
    time: "5 минут назад",
  },
  {
    id: 2,
    icon: "mdi-account-plus",
    title: t("admin.newUserRegistered"),
    time: "12 минут назад",
  },
  {
    id: 3,
    icon: "mdi-flag",
    title: t("admin.newReportSubmitted"),
    time: "23 минуты назад",
  },
  {
    id: 4,
    icon: "mdi-sim",
    title: t("admin.esimTariffUpdated"),
    time: "1 час назад",
  },
]);

// SEO мета-теги
useHead({
  title: t("admin.dashboard"),
  meta: [
    { name: "description", content: t("admin.dashboardDesc") },
    { name: "robots", content: "noindex, nofollow" },
  ],
});
</script>

<style scoped>
.admin-dashboard {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding-top: 24px;
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card .v-card-text {
  color: white;
}

.chart-placeholder {
  min-height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
