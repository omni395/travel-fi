<!-- pages/admin/audit.vue -->
<template>
  <v-container
    fluid
    class="admin-audit-page pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <!-- Breadcrumbs -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-4">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" :style="{ color: 'white' }">
        <template v-slot:divider>
          <v-icon color="white" size="small">mdi-chevron-right</v-icon>
        </template>
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :to="item.to" :disabled="item.disabled" class="text-white">{{ item.title }}</v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <h1 class="text-h4 text-white">{{ t('admin.audit.title') }}</h1>

      <v-text-field
        v-model="searchValue"
        :label="t('admin.audit.search')"
        density="compact"
        hide-details
        clearable
        variant="outlined"
        style="max-width: 280px"
        class="white-text-field"
        color="white"
        base-color="white"
      />
    </div>

    <client-only>
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="filteredItems"
        :items-length="totalItems"
        :loading="loading"
        v-model:expanded="expandedRows"
        show-expand
        item-value="id"
        @update:options="loadItems"
        class="admin-table elevation-4"
        :style="{
          background:
            'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
          borderRadius: '12px',
        }"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="pa-4 text-center text-white">
            {{ t("admin.common.noData") }}
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <span class="text-white">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template #item.action="{ item }">
          <v-chip
            size="small"
            :color="getActionColor(item.action)"
            variant="flat"
          >
            {{ item.action }}
          </v-chip>
        </template>

        <template #item.targetType="{ item }">
          <span class="text-white">{{ item.targetType }}</span>
        </template>

        <template #item.targetId="{ item }">
          <span class="text-white">{{ item.targetId ?? "N/A" }}</span>
        </template>

        <template #expanded-row="{ item }">
          <tr class="expanded-row">
            <td :colspan="headers.length + 1" class="pa-4">
              <div class="d-flex flex-column ga-2">
                <div class="d-flex align-center">
                  <span class="text-caption text-white font-weight-bold mr-2"
                    >IP:</span
                  >
                  <span class="text-white">{{
                    item.ipAddress || "unknown"
                  }}</span>
                </div>
                <div class="d-flex align-center">
                  <span class="text-caption text-white font-weight-bold mr-2"
                    >User Agent:</span
                  >
                  <span
                    class="text-white text-truncate"
                    style="max-width: 600px"
                    >{{ item.userAgent || "unknown" }}</span
                  >
                </div>
                <div v-if="item.metadata" class="mt-2">
                  <span
                    class="text-caption text-white font-weight-bold mb-1 d-block"
                    >Metadata:</span
                  >
                  <pre class="metadata-pre">{{
                    JSON.stringify(item.metadata, null, 2)
                  }}</pre>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </client-only>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "~/lib/formatDate";

const { t } = useI18n();
const localePath = useLocalePath();

interface AuditRow {
  id: number;
  action: string;
  targetType?: string;
  targetId?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

const loading = ref(false);
const items = ref<AuditRow[]>([]);
const totalItems = ref(0);
const expandedRows = ref<string[]>([]);
const itemsPerPage = ref(10);
const searchValue = ref("");
const search = ref("");

const breadcrumbs = [
  {
    title: t("admin.breadcrumbs.home") || "Admin",
    to: localePath("/admin"),
    disabled: false,
  },
  {
    title: t("admin.breadcrumbs.audit") || "Audit Logs",
    to: localePath("/admin/audit"),
    disabled: true,
  },
];

const headers = [
  { title: t("admin.audit.columns.date"), key: "createdAt", sortable: true },
  { title: t("admin.audit.columns.action"), key: "action", sortable: true },
  {
    title: t("admin.audit.columns.targetType"),
    key: "targetType",
    sortable: true,
  },
  { title: t("admin.audit.columns.targetId"), key: "targetId", sortable: true },
];

const filteredItems = computed(() => {
  if (!searchValue.value) return items.value;
  const q = searchValue.value.toLowerCase();
  return items.value.filter(
    (r) =>
      (r.createdAt && r.createdAt.toLowerCase().includes(q)) ||
      (r.action && r.action.toLowerCase().includes(q)) ||
      (r.targetType && r.targetType.toLowerCase().includes(q)) ||
      (r.targetId && String(r.targetId).includes(q)) ||
      (r.ipAddress && r.ipAddress.toLowerCase().includes(q)) ||
      (r.userAgent && r.userAgent.toLowerCase().includes(q)),
  );
});

const loadItems = async ({
  page,
  itemsPerPage,
  sortBy,
}: {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: string }[];
}) => {
  loading.value = true;
  try {
    const query = {
      page,
      itemsPerPage,
      sortBy: sortBy[0]?.key || "createdAt",
      sortDesc: sortBy[0]?.order === "desc",
    };
    const resp = await $fetch<{ items: AuditRow[]; total: number }>(
      "/api/admin/audit",
      { query, credentials: "include" },
    );
    items.value = resp.items;
    totalItems.value = resp.total;
  } finally {
    loading.value = false;
  }
};

watch(searchValue, () => {
  search.value = String(Date.now());
});

function getActionColor(action: string): string {
  if (action.includes("CREATE") || action.includes("ADD")) {
    return "success";
  }
  if (action.includes("UPDATE") || action.includes("EDIT")) {
    return "info";
  }
  if (action.includes("DELETE") || action.includes("REMOVE")) {
    return "error";
  }
  if (action.includes("APPROVE")) {
    return "success";
  }
  if (action.includes("REJECT") || action.includes("BAN")) {
    return "error";
  }
  if (action.includes("SUSPEND")) {
    return "warning";
  }
  if (action.includes("LOGIN") || action.includes("LOGOUT")) {
    return "blue-darken-1";
  }
  return "grey";
}

definePageMeta({ layout: "admin" });
</script>

<style scoped>
.admin-audit-page {
  color: white;
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

.admin-table :deep(tr:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
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

.admin-table :deep(.v-data-table__expand-icon) {
  color: white !important;
}

.expanded-row {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.expanded-row td {
  background-color: transparent !important;
}

.metadata-pre {
  background-color: rgba(0, 0, 0, 0.3);
  color: #4fc3f7;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  overflow-x: auto;
  max-width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.v-breadcrumbs-item) {
  color: white !important;
}

:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.7;
}
</style>
