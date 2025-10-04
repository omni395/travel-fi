import { ref, onMounted, readonly } from 'vue'
import type { User } from '@prisma/client'

export const useUser = () => {
  const user = ref<User | null>(null)

  if (process.client) {
    user.value = useState('user', () => null).value
    onMounted(async () => {
      if (!user.value) {
        const { user: sessionUser } = await $fetch<{ user: User | null }>('/api/auth/session')
        user.value = sessionUser
      }
    })
  } else {
    const event = useRequestEvent()
    user.value = event?.context?.auth?.user as User | null || null
  }

  return { user: readonly(user) }
}
