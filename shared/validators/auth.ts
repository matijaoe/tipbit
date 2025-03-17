/**
 * Auth-related validation utilities
 */
import { Roles, AuthProviders, IdentifierTypes } from '../constants/auth'
import type { Role, AuthProvider, IdentifierType } from '../constants/auth'

/**
 * Type guard to check if a value is a valid role
 */
export const isValidRole = (role: string): role is Role => {
  return Roles.includes(role as Role)
}

/**
 * Type guard to check if a value is a valid auth provider
 */
export const isValidAuthProvider = (provider: string): provider is AuthProvider => {
  return AuthProviders.includes(provider as AuthProvider)
}

/**
 * Type guard to check if a value is a valid identifier type
 */
export const isValidIdentifierType = (type: string): type is IdentifierType => {
  return IdentifierTypes.includes(type as IdentifierType)
}
