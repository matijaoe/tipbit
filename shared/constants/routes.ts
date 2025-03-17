/**
 * Route-related constants and types
 */

// Reserved routes that cannot be used as usernames
export const RESERVED_ROUTES = ['dashboard', 'login', 'register', 'admin'] as const
export type ReservedRoute = (typeof RESERVED_ROUTES)[number]

// Routes accessible to all users
export const PUBLIC_ROUTES = ['login', 'register'] as const
export type PublicRoute = (typeof PUBLIC_ROUTES)[number]

// Routes that should be accessible to authenticated users
export const AUTH_ROUTES = ['login', 'register'] as const
export type AuthRoute = (typeof AUTH_ROUTES)[number]
