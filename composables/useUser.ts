import { ref, type Ref, onMounted } from 'vue'
import { useRouter } from '#app'

interface User {
  id: number
  email: string
  role?: 'user' | 'admin'
}

interface ResponseType {
  user?: User
  token?: string
  ok: boolean
  message?: string
}

export const useUser = () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const isAdmin = ref(false)
  const user: Ref<User | null> = ref(null)
  const loading = ref(false)
  const error = ref('')

  const login = async (credentials: { email: string; password: string }) => {
    loading.value = true
    error.value = ''
    try {
      const response: ResponseType = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      if (response.user) {
        user.value = response.user
        isAuthenticated.value = true
        isAdmin.value = response.user.role === 'admin'
        if (process.client) {
          localStorage.setItem('token', response.token || '')
        }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Login error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (data: { email: string; password: string; confirmPassword: string; agreeTerms: boolean }) => {
    loading.value = true
    error.value = ''
    try {
      const response: ResponseType = await $fetch('/api/auth/register', {
        method: 'POST',
        body: data
      })
      if (response.user) {
        user.value = response.user
        isAuthenticated.value = true
        isAdmin.value = response.user.role === 'admin'
      } else {
        throw new Error(response.message || 'Register failed')
      }
    } catch (err: any) {
      error.value = err.data?.message || 'Register error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      isAuthenticated.value = false
      isAdmin.value = false
      if (process.client) {
        localStorage.removeItem('token')
      }
      router.push('/auth/login')
    } catch (err: any) {
      error.value = err.data?.message
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    if (process.client) {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response: ResponseType = await $fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.user) {
            user.value = response.user
            isAuthenticated.value = true
            isAdmin.value = response.user.role === 'admin'
          } else {
            localStorage.removeItem('token')
          }
        } catch (err: any) {
          console.error('User init error:', err)
          localStorage.removeItem('token')
        }
      }
    }
  })

  return { user, isAuthenticated, isAdmin, login, register, logout, loading, error }
}
