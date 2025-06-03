/**
 * Route-related validation utilities
 */
import { RESERVED_ROUTES, PUBLIC_ROUTES, AUTH_ROUTES } from '../constants/routes'
import type { ReservedRoute, PublicRoute, AuthRoute } from '../constants/routes'

/**
 * Type guard to check if a route is a reserved route
 */
export const isReservedRoute = (route: string): route is ReservedRoute => {
  return RESERVED_ROUTES.includes(route as ReservedRoute)
}

/**
 * Type guard to check if a route is a public route
 */
export const isPublicRoute = (route: string): route is PublicRoute => {
  return PUBLIC_ROUTES.includes(route as PublicRoute)
}

/**
 * Type guard to check if a route is an auth route
 */
export const isAuthRoute = (route: string): route is AuthRoute => {
  return AUTH_ROUTES.includes(route as AuthRoute)
}
