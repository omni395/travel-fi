<template>
  <div class="d-flex align-center">
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-thumb-up"
          variant="text"
          size="small"
          :color="upvoted ? 'primary' : undefined"
          v-bind="props"
          :disabled="loading"
          @click="vote(true)"
        />
      </template>
      <span>{{ $t('common.upvote') }}</span>
    </v-tooltip>

    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-thumb-down"
          variant="text"
          size="small"
          :color="downvoted ? 'error' : undefined"
          v-bind="props"
          :disabled="loading"
          @click="vote(false)"
        />
      </template>
      <span>{{ $t('common.downvote') }}</span>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vuetify/labs/toast'

const props = defineProps({
  targetId: {
    type: Number,
    required: true
  },
  targetType: {
    type: String,
    required: true,
    validator: (value: string) => ['Review', 'SecurityReport', 'WifiPoint'].includes(value)
  }
})

const toast = useToast()
const loading = ref(false)
const upvoted = ref(false)
const downvoted = ref(false)

async function vote(isUpvote: boolean) {
  if (!loading.value) {
    try {
      loading.value = true
      const response = await $fetch('/api/vote', {
        method: 'POST',
        body: {
          targetId: props.targetId,
          targetType: props.targetType,
          isUpvote
        }
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // Обновляем состояние
      upvoted.value = isUpvote
      downvoted.value = !isUpvote

      toast.success(isUpvote ? 'Голос учтен' : 'Голос учтен')
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Не удалось проголосовать')
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  try {
    // Получаем текущий голос пользователя, если есть
    const vote = await $fetch(`/api/vote/${props.targetType}/${props.targetId}`)
    if (vote) {
      upvoted.value = vote.type === 'upvote'
      downvoted.value = vote.type === 'downvote'
    }
  } catch (error) {
    console.error('Error fetching vote:', error)
  }
})
</script>