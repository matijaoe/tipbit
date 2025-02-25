import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  console.log('🔥 [route-protection.global] :', to)

  // Handle dashboard routes
  if (to.name === 'dashboard' || to.name?.toString().startsWith('dashboard-')) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated.value) {
      console.log('dashboard route requires authentication')
      return navigateTo('/login')
    }
    return
  }

  // Handle auth routes (login/register)
  if (to.name === 'login' || to.name === 'register') {
    const { isAuthenticated } = useAuth()
    if (isAuthenticated.value) {
      console.log('already authenticated, redirecting to home')
      return navigateTo('/')
    }
    return
  }

  return
})
