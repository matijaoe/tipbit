import { computed } from 'vue'

// In a real application, this would be connected to your backend authentication system
// For now, we'll use a simple state management approach with Nuxt's useState

type User = {
  id: string
  username: string
  isSuperAdmin: boolean
}

export const useAuth = () => {
  // Use Nuxt's useState for SSR-friendly state management
  const currentUser = useState<User | null>('currentUser', () => null)
  const isLoading = useState<boolean>('authLoading', () => false)

  // Computed properties for auth state
  const isAuthenticated = computed(() => !!currentUser.value)

  // Mock login function
  const login = async (username: string, password: string = 'admin') => {
    isLoading.value = true

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (username === 'super-admin' && password === 'admin') {
        currentUser.value = {
          id: crypto.randomUUID(),
          username,
          isSuperAdmin: true,
        }
        return { success: true }
      }

      const userExists = await $fetch(`/api/users/${username}`)

      // Always use 'admin' as password
      if (userExists && password === 'admin') {
        currentUser.value = {
          id: crypto.randomUUID(),
          username,
          isSuperAdmin: username === 'super-admin',
        }
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
