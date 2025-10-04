export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useState('user', () => null)
  if (to.path.startsWith('/auth/') || to.path === '/') return // Allow auth pages and home

  const { data: { user: sessionUser } } = await $fetch('/api/auth/session')
  user.value = sessionUser

  if (!user.value && to.path !== '/') {
    return navigateTo('/auth/login')
  }

  if (user.value && to.path === '/') {
    return navigateTo('/dashboard')
  }
})
