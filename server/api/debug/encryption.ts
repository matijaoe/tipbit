// Debug endpoint to verify encryption key
// IMPORTANT: This should be removed in production!

import { verifyStorageEncryptionKey } from '../../utils/encryption'

export default defineEventHandler(async (_event) => {
  try {
    const isValid = await verifyStorageEncryptionKey()

    return {
      status: isValid ? 'ok' : 'error',
      message: isValid ? 'Encryption key is valid' : 'Encryption key is invalid',
    }
  } catch (error) {
    console.error('Error verifying encryption key:', error)
    return {
      status: 'error',
      message: 'Error verifying encryption key',
      error: String(error),
    }
  }
})
