import { createError } from 'h3'
import { generateEncryptionKey } from '~~/server/utils/encryption'

/**
 * Admin-only endpoint to generate a secure encryption key for environment variables
 * GET /api/admin/generate-encryption-key
 * Requires admin user session
 */
export default defineEventHandler(async (event) => {
  // Require user session with admin role
  const { user } = await requireUserSession(event)

  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'This endpoint is restricted to administrators',
    })
  }

  try {
    const encryptionKey = await generateEncryptionKey()
    return {
      encryptionKey,
      message: 'Use this key as the value for NUXT_ENCRYPTION_KEY in your environment variables',
    }
  } catch (error) {
    console.error('Error generating encryption key:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate encryption key',
    })
  }
})
