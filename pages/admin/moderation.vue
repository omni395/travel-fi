<template>
  <v-container
    fluid
    class="admin-moderation-page pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <h1 class="text-h4 mb-4 text-white">{{ t('admin.moderation') || 'Moderation' }}</h1>

    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center gap-3">
          <v-text-field v-model="search" placeholder="Search SSID or description" append-icon="mdi-magnify" @input="load" />
          <v-select v-model="status" :items="['','pending','approved','rejected']" dense hide-details style="max-width:180px;" @update:model-value="load">
            <template #item="{ item }">
              <v-list-item-title>{{ item === '' ? (t('admin.all') || 'All') : item }}</v-list-item-title>
            </template>
          </v-select>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table :items="points" :headers="headers" :loading="loading" :no-data-text="t('admin.noPoints') || 'No Wi-Fi points found'" class="admin-table elevation-4">
          <template #item.actions="{ item }">
            <v-btn size="small" color="success" @click="approve(item)">Approve</v-btn>
            <v-btn size="small" color="error" @click="reject(item)">Reject</v-btn>
            <v-btn size="small" variant="outlined" @click="openDetail(item)">View</v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="detailDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ detailPoint?.ssid }}</span>
          <v-chip
            v-if="toxicityStats"
            :color="getToxicityColor(toxicityStats.description?.scores?.toxic)"
            class="ml-2"
          >
            {{ getToxicityLabel(toxicityStats.description?.scores?.toxic) }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <div v-if="detailPoint">
            <div><strong>By:</strong> {{ detailPoint.user?.name }}</div>
            <div><strong>Description:</strong> {{ detailPoint.description }}</div>
            
            <!-- Токсичность контента -->
            <v-expansion-panels v-if="toxicityStats" class="mt-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  Content Analysis
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list v-if="toxicityStats.description">
                    <v-list-item>
                      <v-list-item-title>Toxic</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ (toxicityStats.description.scores?.toxic * 100).toFixed(1) }}%
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Severe Toxic</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ (toxicityStats.description.scores?.severe_toxic * 100).toFixed(1) }}%
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Obscene</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ (toxicityStats.description.scores?.obscene * 100).toFixed(1) }}%
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Threat</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ (toxicityStats.description.scores?.threat * 100).toFixed(1) }}%
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Insult</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ (toxicityStats.description.scores?.insult * 100).toFixed(1) }}%
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <div style="height:300px; margin-top:8px;">
              <!-- Minimal map placeholder -->
              <div v-if="detailPoint" :id="`map-${detailPoint.id}`" style="width:100%;height:100%;background:#eee;display:flex;align-items:center;justify-content:center;">Map: {{ detailPoint.lat }}, {{ detailPoint.lng }}</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="detailPoint"
            color="success"
            :loading="approving"
            @click="approve(detailPoint)"
          >
            Approve
          </v-btn>
          <v-btn
            v-if="detailPoint"
            color="error"
            :loading="rejecting"
            @click="reject(detailPoint)"
          >
            Reject
          </v-btn>
          <v-spacer />
          <v-btn text @click="detailDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCsrf } from '~/composables/useCsrf'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
definePageMeta({ layout: 'admin' })

const points = ref<any[]>([])
const loading = ref(false)
const approving = ref(false)
const rejecting = ref(false)
const search = ref('')
const status = ref('pending')
const detailDialog = ref(false)
const detailPoint = ref<any | null>(null)
const toxicityStats = ref<any | null>(null)
const { csrfToken } = useCsrf()
const toast = useToast()

const getToxicityColor = (score: number | undefined) => {
  if (!score) return 'grey'
  if (score > 0.7) return 'error'
  if (score > 0.5) return 'warning'
  return 'success'
}

const getToxicityLabel = (score: number | undefined) => {
  if (!score) return 'Unknown'
  if (score > 0.7) return 'Toxic'
  if (score > 0.5) return 'Suspicious'
  return 'Safe'
}

const headers = [
  { title: 'SSID', key: 'ssid' },
  { title: 'User', key: 'user' },
  { title: 'Status', key: 'status' },
  { title: 'Created', key: 'createdAt' },
  { title: 'Actions', key: 'actions' },
]

async function load() {
  loading.value = true
  try {
  const res: any = await $fetch('/api/admin/wifi', { method: 'GET', credentials: 'include', params: { status: status.value, search: search.value } })
    points.value = res.data?.points || []
  } catch (err) {
    console.error('Failed load points', err)
  } finally {
    loading.value = false
  }
}

onMounted(load)

// showApproved removed — live refresh via load()

async function openDetail(item: any) {
  detailPoint.value = item
  detailDialog.value = true
  toxicityStats.value = null

  try {
    const res = await $fetch(`/api/admin/moderation/toxicity-stats/${item.id}`, { 
      method: 'GET',
      credentials: 'include'
    })
    toxicityStats.value = res.data
  } catch (err) {
    console.error('Failed to fetch toxicity stats:', err)
    toast.error({
      title: t('admin.common.error') || 'Error',
      message: 'Failed to load content analysis',
      position: 'topRight',
      timeout: 5000
    })
  }
}

async function approve(item: any) {
  approving.value = true
  try {
    const body: any = { _csrf: csrfToken.value }
    await $fetch(`/api/admin/wifi/${item.id}/approve`, { 
      method: 'POST',
      credentials: 'include',
      body
    })
    await load()
    detailDialog.value = false
    toast.success({
      title: t('admin.common.success') || 'Success',
      message: t('admin.moderation.approved') || 'Approved',
      position: 'topRight',
      timeout: 3000
    })
  } catch (err) {
    console.error('approve error', err)
    toast.error({
      title: t('admin.common.error') || 'Error',
      message: err?.data?.statusMessage || err?.message || 'Failed to approve',
      position: 'topRight',
      timeout: 5000
    })
  } finally {
    approving.value = false
  }
}

async function reject(item: any) {
  rejecting.value = true
  try {
    const body: any = { _csrf: csrfToken.value }
    await $fetch(`/api/admin/wifi/${item.id}/reject`, {
      method: 'POST',
      credentials: 'include',
      body
    })
    await load()
    detailDialog.value = false
  } catch (err) {
    console.error('reject error', err)
    toast.error({
      title: t('admin.common.error') || 'Error',
      message: err?.data?.statusMessage || err?.message || 'Failed to reject',
      position: 'topRight',
      timeout: 5000
    })
  } finally {
    rejecting.value = false
  }
}
</script>

<style scoped>
/* minimal styles */
</style>