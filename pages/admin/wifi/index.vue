<template>
  <v-container
    fluid
    class="admin-wifi-page pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <div class="d-flex align-center justify-space-between mb-4">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" :style="{ color: 'white' }">
        <template v-slot:divider>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>

      <h1 class="text-h4 mb-0 text-white">{{ t('admin.wifi.title') || 'Wi-Fi Points' }}</h1>
    </div>

    <div class="d-flex align-center mb-4 flex-wrap ga-2">
      <v-text-field
        v-model="search"
        :label="t('admin.wifi.search')"
        :placeholder="t('admin.wifi.searchPlaceholder')"
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
            <span class="text-caption">{{ status || 'Status' }}</span>
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
            <v-list-item-title class="text-white">{{ t('admin.users.allStatuses') || 'All Statuses' }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-for="s in statusesList" :key="s" @click="status = s" class="filter-item">
            <v-list-item-title class="text-white">{{ s }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn color="primary" small @click="load({ page:1, itemsPerPage: itemsPerPage })">{{ t('admin.common.refresh') || 'Refresh' }}</v-btn>
    </div>

    <v-data-table-server
      :headers="headers"
      :items="items"
      :items-length="total"
      :loading="loading"
      :items-per-page="itemsPerPage"
      @update:options="load"
      @click:row="goToDetail"
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
        <div class="pa-4 text-center">{{ t('admin.common.noData') || 'No data available' }}</div>
      </template>

      <template #item.user="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" class="mr-2">
            <img :src="item.user?.profilePicture || '/no-image.png'" />
          </v-avatar>
          <div>{{ item.user?.name || t('admin.common.userPrefix') + item.user?.id }}</div>
        </div>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">{{ t(`admin.wifi.status.${item.status}`) }}</v-chip>
      </template>

      <template #item.createdAt="{ item }">
        <span>{{ formatDate(item.createdAt) }}</span>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate } from '~/lib/formatDate'
import { useRouter } from 'vue-router'
const localePath = useLocalePath()

definePageMeta({ layout: 'admin' })
const { t } = useI18n()
const router = useRouter()

const items = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const itemsPerPage = 20
const search = ref('')
const status = ref<string>('')
const statuses = ref<string[]>(['pending', 'approved', 'rejected'])
// convenience unwrapped ref for template binding
const statusesList = statuses

const breadcrumbs = [ { title: t('admin.breadcrumbs.home') || 'Admin', to: localePath('/admin'), disabled: false }, { title: t('admin.wifi.title') || 'Wi-Fi', to: localePath('/admin/wifi'), disabled: true } ]

const headers = [ 
  { title: 'ID', key: 'id', width: 80 }, 
  { title: t('wifi.ssid'), key: 'ssid' }, 
  { title: t('admin.common.user'), key: 'user', width: 220 }, 
  { title: t('admin.common.status'), key: 'status', width: 140 }, 
  { title: t('admin.common.createdAt'), key: 'createdAt', width: 180 } 
]

let lastOptions: any = { page: 1, itemsPerPage }
async function load(options: any) {
  lastOptions = options
  loading.value = true
  try {
    const q = new URLSearchParams({ page: String(options?.page || 1), pageSize: String(options?.itemsPerPage || itemsPerPage), search: search.value || '', status: status.value || '' })
    const response: any = await $fetch(`/api/admin/wifi?${q.toString()}`, { credentials: 'include' })
    items.value = response.data?.points || []
    total.value = response.data?.total || 0
  } catch (err) {
    console.error('Failed load wifi points', err)
  } finally {
    loading.value = false
  }
}

function goToDetail(event: any, { item }: any) {
  if (item && item.id) router.push(localePath(`/admin/wifi/${item.id}`))
}

function getStatusColor(statusStr: string) {
  switch (statusStr) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'grey'
  }
}

onMounted(() => load(lastOptions))

let timer: any
watch([search, status], () => { clearTimeout(timer); timer = setTimeout(() => load({ ...lastOptions, page: 1 }), 300) })
</script>

<style scoped>
.admin-wifi-page { min-height: calc(100vh - 64px); }

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
</style>
