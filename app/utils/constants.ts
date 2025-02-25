/**
 * Type definition for reserved routes
 */
export type ReservedRoute = 'dashboard' | 'login' | 'register'

/**
 * List of reserved routes that should not be accessible as usernames
 * Used in route protection middleware and username validation
 */
export const RESERVED_ROUTES: ReservedRoute[] = ['dashboard', 'login', 'register']

/**
 * Type guard to check if a route is a reserved route
 */
export const isReservedRoute = (route: string): route is ReservedRoute => {
  return RESERVED_ROUTES.includes(route as ReservedRoute)
}
