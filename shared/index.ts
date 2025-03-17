/**
 * Shared code between frontend and backend
 * Main entry point that provides access to top-level domains
 */

// Core system-wide utilities and constants
export * from './constants' // Access via: import { Roles, AuthProviders } from '~/shared'
export * from './validators' // Access via: import { isValidRole } from '~/shared'
export * from './utils' // Access via: import { formatDateTime } from '~/shared'

/**
 * Domain-specific modules
 * Import these directly from their respective domains:
 *
 * Payments: import { Invoice } from '~/shared/payments'
 * Providers: import { StrikeAdapter } from '~/shared/providers/strike'
 */
