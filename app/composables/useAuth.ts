import { computed } from 'vue'
import type { MockUser } from '~~/server/utils/mock-users'

// In a real application, this would be connected to your backend authentication system
// For now, we'll use a simple state management approach with Nuxt's useState

export const useAuth = () => {
  // Use Nuxt's useState for SSR-friendly state management
  const currentUser = useState<MockUser | null>('currentUser', () => null)
  const isLoading = useState<boolean>('authLoading', () => false)

  // Computed properties for auth state
  const isAuthenticated = computed(() => !!currentUser.value)

  // Mock login function
  const login = async (username: string, password: string = 'admin') => {
    isLoading.value = true

    try {
      const userData = await $fetch(`/api/users/${username}`)

      console.log('👀 userData :', userData)

      // Always use 'admin' as password
      if (userData && password === 'admin') {
        currentUser.value = userData
        return { success: true }
      }

      return { success: false, message: 'Invalid credentials' }
    } catch (error) {
      console.error('🚨 [login] :', error)
      return { success: false, message: 'Invalid credentials' }
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = () => {
    currentUser.value = null
  }

  // Check if user can access a protected route
  const canAccess = (route: string) => {
    // Protected routes that require authentication
    const protectedRoutes = ['dashboard']

    // Routes that require dashboard privileges
    const adminRoutes = ['dashboard']

    // Check if route requires dashboard
    if (adminRoutes.includes(route)) {
      return isAuthenticated.value
    }

    // Check if route requires authentication
    if (protectedRoutes.includes(route)) {
      return isAuthenticated.value
    }

    // Public routes
    return true
  }

  return {
    user: currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    canAccess,
  }
}
