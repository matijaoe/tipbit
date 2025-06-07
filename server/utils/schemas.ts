import { z } from 'zod'

/**
 * Common validation schemas for reuse across the application
 */

// User schemas  
export const usernameSchema = z.string().min(1, 'Username is required').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
export const userIdSchema = z.string().uuid('Invalid user ID')

// Legacy schemas (for backward compatibility)
export const handleSchema = usernameSchema // alias for migration
export const profileIdSchema = userIdSchema // alias for migration

// Connection schemas
export const connectionIdSchema = z.string().uuid('Invalid connection ID')

// Strike schemas
export const strikeHandleSchema = z.string().min(1, 'Strike handle is required')
