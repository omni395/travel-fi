import { ref, onMounted } from 'vue'

export const useCsrf = () => {
  const csrfToken = ref('')

  onMounted(async () => {
    try {
      const { csrf } = await $fetch('/api/csrf', { credentials: 'include' })
      csrfToken.value = csrf
    } catch (e) {
      console.error('CSRF init error:', e)
    }
  })

  return { csrfToken }
}
