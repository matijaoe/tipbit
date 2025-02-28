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

  // Special handling for index route - redirect to login or dashboard
  if (to.path === '/') {
    if (loggedIn.value) {
      return navigateTo('/dashboard')
    } else {
      return navigateTo('/login')
    }
  }

  if (isDashboardRoute(to)) {
    if (!loggedIn.value) {
      console.log('dashboard route requires authentication')
      return navigateTo('/login')
    }
    return
  }

  if (isAuthRoute(to)) {
    if (loggedIn.value) {
      console.log('already authenticated, redirecting to home')
      return navigateTo('/')
    }
    return
  }

  // If user is logged in and trying to access a public route, redirect to dashboard
  if (loggedIn.value && isPublicRoute(to.name as string)) {
    return navigateTo('/dashboard')
  }

  return
})
