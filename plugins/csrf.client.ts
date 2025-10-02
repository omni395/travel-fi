export default defineNuxtPlugin(async (nuxtApp) => {
  const csrfToken = ref<string | null>(null)
  const loading = ref(false)

  const fetchCsrfToken = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/csrf')
      csrfToken.value = data.csrfToken
    } catch (err) {
      console.error('Failed to fetch CSRF token:', err)
      csrfToken.value = null
    } finally {
      loading.value = false
    }
  }

  // Fetch on plugin init
  await fetchCsrfToken()

  // Refresh on navigate if null
  nuxtApp.hook('app:created', () => {
    if (!csrfToken.value) fetchCsrfToken()
  })

  return {
    provide: {
      csrfToken,
      loading,
      fetchCsrfToken
    }
  }
})
