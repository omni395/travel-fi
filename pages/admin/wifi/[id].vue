<template>
  <v-container
    fluid
    class="admin-wifi-detail pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <div class="d-flex align-center justify-space-between mb-4">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" :style="{ color: 'white' }">
        <template #divider>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>

      <h1 class="text-h4 mb-0 text-white">{{ point?.ssid || (t('admin.wifi.detail') || 'Wi-Fi Detail') }}</h1>
    </div>

    <v-progress-circular v-if="loading" indeterminate color="white" class="d-flex mx-auto mt-6" size="48" />

    <div v-else-if="point">
      <v-card class="user-header-card mb-6" :style="{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px' }">
        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <div>
              <h2 class="text-h5 text-white mb-2">{{ point.ssid }}</h2>
              <div class="text-white">{{ point.description }}</div>
              <div class="text-white mt-2"><strong>Status:</strong> <v-chip size="small" variant="flat" :color="getStatusColor(point.status)">{{ point.status }}</v-chip></div>
            </div>
            <div class="text-right">
              <div class="text-h5 text-white font-weight-bold">{{ point.user?.name || 'User #' + point.user?.id }}</div>
              <div class="text-caption text-white">{{ point.user?.email || '' }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12">
          <v-card class="pa-4" elevation="2">
            <div style="height:420px;">
              <CustomMap :center="[point.lat, point.lng]" :zoom="16" :markers="[{ id: point.id, lat: point.lat, lng: point.lng, label: point.ssid }]" height="420px" />
            </div>
            <v-divider class="my-4" />
            <div class="d-flex justify-space-between">
              <div>
                <div><strong>By:</strong> {{ point.user?.name }}</div>
                <div><strong>Description:</strong> {{ point.description }}</div>
              </div>
              <div>
                <v-btn color="success" @click="approve">{{ t('admin.moderation.approve') || 'Approve' }}</v-btn>
                <v-btn color="error" @click="reject">{{ t('admin.moderation.reject') || 'Reject' }}</v-btn>
                <v-btn color="error" variant="tonal" @click="removePoint">{{ t('admin.moderation.delete') || 'Delete' }}</v-btn>
                <v-btn text @click="editPoint">{{ t('admin.common.edit') || 'Edit' }}</v-btn>
                <v-btn text @click="back">{{ t('admin.common.back') || 'Back' }}</v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Диалог редактирования -->
    <WifiAddDialog 
      v-model="editDialog" 
      :edit-mode="true" 
      :point-data="point" 
      @success="handleEditSuccess" 
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { formatDate } from '~/lib/formatDate'

definePageMeta({ layout: 'admin' })
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const point = ref<any | null>(null)
const loading = ref(false)
const editDialog = ref(false)
const toast = useToast()

const localePath = useLocalePath()
const breadcrumbs = [
  { title: t('admin.breadcrumbs.home') || 'Admin', to: localePath('/admin'), disabled: false },
  { title: t('admin.wifi.title') || 'Wi-Fi', to: localePath('/admin/wifi'), disabled: false },
  { title: (() => point.value?.ssid)() || t('admin.wifi.detail') || 'Detail', to: localePath(`/admin/wifi/${route.params.id}`), disabled: true },
]

function getStatusColor(statusStr: string) {
  switch (statusStr) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'grey'
  }
}

async function load() {
  loading.value = true
  try {
    const id = route.params.id
    const res: any = await $fetch(`/api/wifi/${id}`, { method: 'GET' })
    if (res.success) point.value = res.data
  } catch (err) {
    console.error('Failed to load point', err)
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function approve() {
  try {
    const csrfResp: any = await $fetch('/api/csrf', { method: 'GET', credentials: 'include' })
    const csrfToken = csrfResp?.csrf
    await $fetch(`/api/admin/wifi/${point.value.id}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken },
      body: { _csrf: csrfToken },
    })
    point.value.status = 'approved'
    toast.success({ title: t('admin.common.success'), message: t('admin.moderation.approved'), position: 'topRight' })
  } catch (err) {
    console.error('approve error', err)
    toast.error({ title: t('admin.common.error'), message: String(err) || 'Failed to approve', position: 'topRight' })
  }
}

async function reject() {
  try {
    const csrfResp: any = await $fetch('/api/csrf', { method: 'GET', credentials: 'include' })
    const csrfToken = csrfResp?.csrf
    await $fetch(`/api/admin/wifi/${point.value.id}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken },
      body: { _csrf: csrfToken },
    })
    point.value.status = 'rejected'
    toast.success({ title: t('admin.common.success'), message: t('admin.moderation.rejected'), position: 'topRight' })
  } catch (err) {
    console.error('reject error', err)
    toast.error({ title: t('admin.common.error'), message: String(err) || 'Failed to reject', position: 'topRight' })
  }
}

async function removePoint() {
  try {
    const csrfResp: any = await $fetch('/api/csrf', { method: 'GET', credentials: 'include' })
    const csrfToken = csrfResp?.csrf
    await $fetch(`/api/admin/wifi/${point.value.id}/delete`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken },
      body: { _csrf: csrfToken },
    })
    toast.success({ title: t('admin.common.success'), message: t('admin.moderation.deleted'), position: 'topRight' })
    router.push(localePath('/admin/wifi'))
  } catch (err) {
    console.error('delete error', err)
    toast.error({ title: t('admin.common.error'), message: String(err) || 'Failed to delete', position: 'topRight' })
  }
}

function editPoint() {
  editDialog.value = true
}

function handleEditSuccess(updatedPoint: any) {
  if (updatedPoint) {
    point.value = updatedPoint
  }
  toast.success({ title: t('admin.common.success'), message: t('admin.wifi.updated') || 'Wi-Fi point updated successfully', position: 'topRight' })
  load() // Перезагружаем данные
}

function back() { router.push(localePath('/admin/wifi')) }
</script>
