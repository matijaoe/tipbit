/**
 * Auth-related constants and types
 */

// User roles
export const Roles = ['USER', 'ADMIN'] as const
export type Role = (typeof Roles)[number]

// Authentication providers
export const AuthProviders = ['github', 'google', 'x', 'twitch'] as const
export type AuthProvider = (typeof AuthProviders)[number]

// Identifier types
export const IdentifierTypes = ['email', 'username', 'passkey'] as const
export type IdentifierType = (typeof IdentifierTypes)[number]
