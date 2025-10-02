import { useUser } from '~/composables/useUser'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { user, isAuthenticated, isAdmin, logout } = useUser()

  return {
    provide: {
      user,
      isAuthenticated,
      isAdmin,
      logout
    }
  }
})
