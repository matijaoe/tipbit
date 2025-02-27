/**
 * List of reserved routes that should not be accessible as usernames
 * Used in route protection middleware and username validation
 */
export const RESERVED_ROUTES = ['dashboard', 'login', 'register'] as const

/**
 * Type definition for reserved routes
 */
export type ReservedRoute = (typeof RESERVED_ROUTES)[number]

/**
 * Type guard to check if a route is a reserved route
 */
export const isReservedRoute = (route: string): route is ReservedRoute => {
  return RESERVED_ROUTES.includes(route as ReservedRoute)
}

/**
 * List of routes that should be accessible to all users
 */
export const PUBLIC_ROUTES = ['login', 'register'] as const

/**
 * Type definition for public routes
 */
export type PublicRoute = (typeof PUBLIC_ROUTES)[number]

/**
 * Type guard to check if a route is a public route
 */
export const isPublicRoute = (route: string): route is PublicRoute => {
  return PUBLIC_ROUTES.includes(route as PublicRoute)
}
