export default defineNuxtRouteMiddleware(async (to, from) => {
  // Exclude public paths
  if (to.path === '/' || to.path.startsWith('/wifi') || to.path.startsWith('/esim') || to.path.startsWith('/about') || to.path.startsWith('/auth/')) {
    return
  }

  // Server-side check using $fetch
  let session = null
  try {
    session = await $fetch('/api/auth/session').catch(() => null)
  } catch (e) {
    session = null
  }

  if (!session?.user && (to.path === '/dashboard' || to.path === '/profile' || to.path.startsWith('/admin'))) {
    const { $localePath } = useNuxtApp()
    return navigateTo($localePath('/auth/login'))
  }

  // Admin check
  if (to.path.startsWith('/admin') && session?.user?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }
})
