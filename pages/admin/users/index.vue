<!-- pages/admin/users.vue -->
<template>
  <v-container
    fluid
    class="admin-users-page pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <!-- Breadcrumbs -->
    <div class="d-flex align-center justify-space-between mb-4">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" :style="{ color: 'white' }">
        <template v-slot:divider>
          <v-icon color="white" size="small">mdi-chevron-right</v-icon>
        </template>
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :to="item.to" :disabled="item.disabled" class="text-white">{{ item.title }}</v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <h1 class="text-h4 mb-0 text-white">{{ t('admin.users.title') || 'Users' }}</h1>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="stats-card pa-3"
          flat
          :style="{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
          }"
        >
          <div class="d-flex align-center ga-3">
            <v-icon size="32" color="white">mdi-account-group</v-icon>
            <div>
              <div class="text-h5 text-white font-weight-bold">{{ total }}</div>
              <div class="text-caption text-white">
                {{ t("admin.stats.totalUsers") || "Total Users" }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="stats-card pa-3"
          flat
          :style="{
            background: 'rgba(76, 175, 80, 0.3)',
            borderRadius: '12px',
          }"
        >
          <div class="d-flex align-center ga-3">
            <v-icon size="32" color="white">mdi-check-circle</v-icon>
            <div>
              <div class="text-h5 text-white font-weight-bold">
                {{ stats.active || 0 }}
              </div>
              <div class="text-caption text-white">
                {{ t("admin.stats.activeUsers") || "Active" }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="stats-card pa-3"
          flat
          :style="{
            background: 'rgba(255, 152, 0, 0.3)',
            borderRadius: '12px',
          }"
        >
          <div class="d-flex align-center ga-3">
            <v-icon size="32" color="white">mdi-pause-circle</v-icon>
            <div>
              <div class="text-h5 text-white font-weight-bold">
                {{ stats.suspended || 0 }}
              </div>
              <div class="text-caption text-white">
                {{ t("admin.stats.suspendedUsers") || "Suspended" }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="stats-card pa-3"
          flat
          :style="{
            background: 'rgba(244, 67, 54, 0.3)',
            borderRadius: '12px',
          }"
        >
          <div class="d-flex align-center ga-3">
            <v-icon size="32" color="white">mdi-cancel</v-icon>
            <div>
              <div class="text-h5 text-white font-weight-bold">
                {{ stats.banned || 0 }}
              </div>
              <div class="text-caption text-white">
                {{ t("admin.stats.bannedUsers") || "Banned" }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex align-center mb-4 flex-wrap ga-2">
      <v-text-field
        v-model="search"
        :label="t('admin.users.search') || 'Search users'"
        density="compact"
        hide-details
        variant="outlined"
        style="max-width: 280px"
        class="white-text-field"
        color="white"
        base-color="white"
      />

      <v-menu>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="outlined"
            color="white"
            class="filter-menu-btn"
            size="small"
          >
            <span class="text-caption">{{ role || "Role" }}</span>
            <v-icon size="small" class="ml-1" end>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list
          :style="{
            background:
              'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
            minWidth: '160px',
            padding: '4px 0',
          }"
          class="filter-list"
        >
          <v-list-item @click="role = ''" class="filter-item">
            <v-list-item-title class="text-white">{{
              t("admin.users.allRoles") || "All Roles"
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="r in roles"
            :key="r"
            @click="role = r"
            class="filter-item"
          >
            <v-list-item-title class="text-white">{{ r }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="outlined"
            color="white"
            class="filter-menu-btn"
            size="small"
          >
            <span class="text-caption">{{ status || "Status" }}</span>
            <v-icon size="small" class="ml-1" end>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list
          :style="{
            background:
              'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
            minWidth: '160px',
            padding: '4px 0',
          }"
          class="filter-list"
        >
          <v-list-item @click="status = ''" class="filter-item">
            <v-list-item-title class="text-white">{{
              t("admin.users.allStatuses") || "All Statuses"
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="s in statuses"
            :key="s"
            @click="status = s"
            class="filter-item"
          >
            <v-list-item-title class="text-white">{{ s }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-data-table-server
      :headers="headers"
      :items="items"
      :items-length="total"
      :loading="loading"
      :items-per-page="itemsPerPage"
      @update:options="load"
      @click:row="goToUserProfile"
      class="admin-table elevation-4"
      :style="{
        background:
          'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
        borderRadius: '12px',
      }"
      hover
    >
      <template #loading>
        <v-skeleton-loader type="table-row@5" />
      </template>

      <template #no-data>
        <div class="pa-4 text-center text-white">
          {{ t("admin.common.noData") || "No data available" }}
        </div>
      </template>

      <template #item.createdAt="{ item }">
        <span class="text-white">{{ formatDate(item.createdAt) }}</span>
      </template>

      <template #item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          variant="flat"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.role="{ item }">
        <v-chip :color="getRoleColor(item.role)" size="small" variant="flat">
          {{ item.role }}
        </v-chip>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "~/lib/formatDate";

definePageMeta({ layout: "admin" });
const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

const items = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const itemsPerPage = 20;
const search = ref("");
const role = ref("");
const status = ref("");
const roles = ["user", "moderator", "admin"];
const statuses = ["active", "suspended", "banned"];

const stats = ref({
  active: 0,
  suspended: 0,
  banned: 0,
});

const breadcrumbs = [
  {
    title: t("admin.breadcrumbs.home") || "Admin",
    to: localePath("/admin"),
    disabled: false,
  },
  {
    title: t("admin.breadcrumbs.users") || "Users",
    to: localePath("/admin/users"),
    disabled: true,
  },
];

const headers = [
  { title: "ID", key: "id", width: 80 },
  { title: t("admin.users.email") || "Email", key: "email" },
  { title: t("admin.users.name") || "Name", key: "name" },
  { title: t("admin.users.role") || "Role", key: "role", width: 120 },
  { title: t("admin.users.status") || "Status", key: "status", width: 140 },
  { title: t("admin.users.points") || "Points", key: "points", width: 100 },
  {
    title: t("admin.users.createdAt") || "Created",
    key: "createdAt",
    width: 180,
  },
];

let lastOptions: any = { page: 1, itemsPerPage };
async function load(options: any) {
  lastOptions = options;
  loading.value = true;
  try {
    const q = new URLSearchParams({
      page: String(options?.page || 1),
      pageSize: String(options?.itemsPerPage || itemsPerPage),
      search: search.value || "",
      role: role.value || "",
      status: status.value || "",
    });
    const response = await $fetch(`/api/admin/users?${q}`);
    items.value = response.items;
    total.value = response.total;

    // Update stats
    if (response.stats) {
      stats.value = response.stats;
    }
  } finally {
    loading.value = false;
  }
}

function goToUserProfile(event: any, { item }: any) {
  if (item && item.id) {
    router.push(localePath(`/admin/users/${item.id}`));
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "warning";
    case "banned":
      return "error";
    default:
      return "grey";
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "admin":
      return "red-darken-2";
    case "moderator":
      return "orange-darken-1";
    case "user":
      return "blue-darken-1";
    default:
      return "grey";
  }
}

onMounted(() => {
  load(lastOptions);
});

let timer: any;
watch([search, role, status], () => {
  clearTimeout(timer);
  timer = setTimeout(() => load({ ...lastOptions, page: 1 }), 300);
});
</script>

<style scoped>
.admin-users-page {
  color: white;
  overflow-x: hidden;
}

.white-text-field :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.7);
}

.white-text-field :deep(.v-field__input) {
  color: white;
}

.white-text-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7);
}

.white-text-field :deep(.v-field--focused .v-field__outline) {
  color: white;
}

.white-text-field :deep(.v-field--focused .v-label) {
  color: white;
}

.filter-menu-btn {
  text-transform: none;
  min-width: 120px;
  height: 36px;
  border-color: rgba(255, 255, 255, 0.7) !important;
}

.filter-menu-btn:hover {
  border-color: white !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.filter-list {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px !important;
}

.filter-item {
  padding: 8px 16px !important;
  transition: all 0.2s ease !important;
  cursor: pointer;
}

.filter-item:hover {
  background-color: rgba(255, 255, 255, 0.12) !important;
}

.admin-table {
  overflow: hidden;
}

.admin-table :deep(.v-data-table__thead) {
  background-color: rgba(255, 255, 255, 0.1);
}

.admin-table :deep(th) {
  color: white !important;
  font-weight: 600 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.admin-table :deep(td) {
  color: white !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.admin-table :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.admin-table :deep(tbody tr:hover) {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

.admin-table :deep(.v-table__wrapper) {
  overflow-x: auto;
}

.admin-table :deep(.v-data-table-footer) {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-table :deep(.v-data-table-footer__items-per-page),
.admin-table :deep(.v-data-table-footer__page-text),
.admin-table :deep(.v-select__selection),
.admin-table :deep(.v-icon) {
  color: white !important;
}

.admin-table :deep(.v-btn) {
  color: white !important;
}

.admin-table :deep(.v-btn--disabled) {
  color: rgba(255, 255, 255, 0.3) !important;
}

.admin-table :deep(.v-progress-linear) {
  background-color: rgba(255, 255, 255, 0.2);
}

.admin-table :deep(.v-progress-linear__determinate) {
  background-color: white;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

:deep(.v-breadcrumbs-item) {
  color: white !important;
}

:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.7;
}
</style>
