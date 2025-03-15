import { defineNuxtRouteMiddleware } from '#app'
import type { RouteLocation } from 'vue-router'

const isDashboardRoute = (to: RouteLocation) => {
  return to.name === 'dashboard' || to.name?.toString().startsWith('dashboard-')
}

const isAuthRoute = (to: RouteLocation) => {
  const authRoutes = ['login', 'register']
  return authRoutes.includes(to.name as string)
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()

  if (to.path === '/') {
    if (loggedIn.value) {
      return navigateTo('/dashboard')
    } else {
      return navigateTo('/login')
    }
  }

  if (isDashboardRoute(to)) {
    if (!loggedIn.value) {
      return navigateTo('/login')
    }
    return
  }

  if (isAuthRoute(to)) {
    if (loggedIn.value) {
      return navigateTo('/')
    }
    return
  }

  if (loggedIn.value && isPublicRoute(to.name as string)) {
    return navigateTo('/dashboard')
  }

  return
})
