// Компонент для отображения баланса токенов и истории транзакций
<template>
  <div>
    <!-- Баланс токенов -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-wallet" class="me-2" />
        {{ $t('wallet.balance') }}
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="d-flex justify-center">
          <v-progress-circular indeterminate />
        </div>
        <div v-else-if="error" class="text-error">
          {{ error }}
        </div>
        <div v-else class="text-h4 font-weight-bold">
          {{ balance }} TRAVELFI
        </div>
      </v-card-text>
    </v-card>

    <!-- История транзакций -->
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-history" class="me-2" />
        {{ $t('wallet.transactions') }}
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="d-flex justify-center">
          <v-progress-circular indeterminate />
        </div>
        <div v-else-if="error" class="text-error">
          {{ error }}
        </div>
        <div v-else>
          <v-list v-if="transactions.length > 0">
            <v-list-item
              v-for="tx in transactions"
              :key="tx.hash"
              :subtitle="formatDate(new Date(tx.timestamp))"
            >
              <template v-slot:prepend>
                <v-icon
                  :icon="tx.type === 'received' ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                  :color="tx.type === 'received' ? 'success' : 'info'"
                />
              </template>

              <v-list-item-title>
                {{ tx.amount }} TRAVELFI
                {{ tx.type === 'received' ? $t('wallet.received') : $t('wallet.sent') }}
              </v-list-item-title>

              <template v-slot:append>
                <v-btn
                  variant="text"
                  size="small"
                  :href="`https://sepolia.etherscan.io/tx/${tx.hash}`"
                  target="_blank"
                >
                  {{ $t('wallet.viewOnExplorer') }}
                  <v-icon icon="mdi-open-in-new" size="small" class="ms-1" />
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center pa-4">
            {{ $t('wallet.noTransactions') }}
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatDate } from '~/lib/formatDate'

const loading = ref(true)
const error = ref<string | null>(null)
const balance = ref('0')
const transactions = ref<any[]>([])

const fetchTokenData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const { data } = await useFetch('/api/token/balance')
    if (data.value) {
      balance.value = data.value.balance
      transactions.value = data.value.transactions
    }
  } catch (err: any) {
    console.error('Error fetching token data:', err)
    error.value = err.message || 'Failed to load wallet data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTokenData()
})
</script>