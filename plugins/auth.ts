export default defineNuxtPlugin(async (nuxtApp) => {
  console.log('Auth plugin: initializing...')
  
  // Получаем конфигурацию для базового URL
  const config = useRuntimeConfig()
  console.log('Auth plugin: API base:', config.public.apiBase)
  
  const { fetchUser } = useUser()
  
  try {
    // Загружаем пользователя при старте приложения
    await fetchUser()
  } catch (error) {
    console.error('Auth plugin: Failed to fetch initial user state:', error)
    // Продолжаем работу даже при ошибке
  }
})