export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useState('user', () => null)
  // Если пользователь авторизован, не пускать на /auth/login и /auth/register
  if ((to.path === '/auth/login' || to.path === '/auth/register')) {
    const { data: { user: sessionUser } } = await $fetch('/api/auth/session')
    if (sessionUser) {
      return navigateTo('/dashboard')
    }
    return // разрешить неавторизованным
  }
  if (to.path === '/') return // Allow home

  const { data: { user: sessionUser } } = await $fetch('/api/auth/session')
  user.value = sessionUser

  if (!user.value && to.path !== '/') {
    return navigateTo('/auth/login')
  }

  if (user.value && to.path === '/') {
    return navigateTo('/dashboard')
  }
})
