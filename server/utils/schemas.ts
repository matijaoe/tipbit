import { z } from 'zod'

/**
 * Common validation schemas for reuse across the application
 */

// Profile schemas
export const handleSchema = z.string().min(1, 'Profile handle is required')
export const profileIdSchema = z.string().uuid('Invalid profile ID')

// Connection schemas
export const connectionIdSchema = z.string().uuid('Invalid connection ID')

// Strike schemas
export const strikeHandleSchema = z.string().min(1, 'Strike handle is required')
