import { createError } from 'h3'
import _sodium from 'libsodium-wrappers'

let sodium: typeof _sodium | null = null

// Initialize libsodium (called automatically on first use)
const initialize = async () => {
  if (!sodium) {
    await _sodium.ready
    sodium = _sodium
  }
}

/**
 * Generates a secure encryption key as a base64 string
 * Use this to generate a key for the NUXT_ENCRYPTION_KEY environment variable
 */
export const generateEncryptionKey = async (): Promise<string> => {
  await _sodium.ready
  const keyBytes = _sodium.randombytes_buf(_sodium.crypto_secretbox_KEYBYTES)
  return _sodium.to_base64(keyBytes)
}

/**
 * Verifies the encryption key is valid
 * This can be used to check if the application is configured correctly
 */
export const verifyStorageEncryptionKey = async (): Promise<boolean> => {
  try {
    await _sodium.ready

    const config = useRuntimeConfig()
    const encryptionKey = config.encryptionKey

    if (!encryptionKey) {
      console.error('Encryption key is missing')
      return false
    }

    if (encryptionKey.length < 32) {
      console.error(`Encryption key is too short: ${encryptionKey.length} chars`)
      return false
    }

    // Just test a basic encryption/decryption roundtrip
    try {
      const testString = 'test-encryption-key'
      const encrypted = await encryptForStorage(testString)

      if (!encrypted) {
        console.error('Failed to encrypt test string')
        return false
      }

      const decrypted = await decryptFromStorage(encrypted)

      if (decrypted === testString) {
        console.log('Encryption key validation successful')
        return true
      } else {
        console.error('Encryption key validation failed: decrypted text does not match original')
        return false
      }
    } catch (error) {
      console.error('Failed to verify encryption key:', error)
      return false
    }
  } catch (error) {
    console.error('Error verifying encryption key:', error)
    return false
  }
}

/**
 * Encrypts sensitive data using libsodium secretbox
 * @param data The data to encrypt
 * @returns The encrypted data as a base64 string
 * @deprecated Use encryptForStorage instead
 */
export const encrypt = async (data: string): Promise<string> => {
  if (!data) return ''

  try {
    // Initialize libsodium
    await _sodium.ready
    console.log('Libsodium initialized successfully')

    const config = useRuntimeConfig()
    const encryptionKey = config.encryptionKey

    // Debug logging (be careful not to log the entire key in production)
    console.log(`Encryption key exists: ${!!encryptionKey}`)
    console.log(`Encryption key length: ${encryptionKey?.length || 0}`)

    if (!encryptionKey) {
      console.error('Encryption key is missing')
      throw createError({
        statusCode: 500,
        message: 'Encryption key is missing',
      })
    }

    if (encryptionKey.length < 32) {
      console.error(`Encryption key is too short: ${encryptionKey.length} chars`)
      throw createError({
        statusCode: 500,
        message: 'Encryption key is invalid (too short)',
      })
    }

    // Validate that the key is valid base64
    try {
      const keyBuffer = _sodium.from_base64(encryptionKey)
      console.log(`Successfully decoded key to buffer of length: ${keyBuffer.length}`)
    } catch (decodeError) {
      console.error('Failed to decode base64 encryption key:', decodeError)
      throw createError({
        statusCode: 500,
        message: 'Encryption key is not valid base64',
      })
    }

    // Generate a random nonce
    const nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES)
    console.log(`Generated nonce of length: ${nonce.length}`)

    // Convert key to Uint8Array
    const keyBuffer = _sodium.from_base64(encryptionKey)

    // Encrypt the data
    const cipher = _sodium.crypto_secretbox_easy(_sodium.from_string(data), nonce, keyBuffer)
    console.log(`Successfully encrypted data to cipher of length: ${cipher.length}`)

    // Combine nonce and cipher for storage (nonce is needed for decryption)
    const combined = new Uint8Array(nonce.length + cipher.length)
    combined.set(nonce)
    combined.set(cipher, nonce.length)

    // Return as base64 string for storage
    const result = _sodium.to_base64(combined)
    console.log(`Successfully encoded result to base64 of length: ${result.length}`)
    return result
  } catch (error) {
    console.error('Error encrypting data:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to encrypt data',
      cause: error,
    })
  }
}

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedData The encrypted data as a base64 string
 * @returns The decrypted data
 * @deprecated Use decryptFromStorage instead
 */
export const decrypt = async (encryptedData: string): Promise<string> => {
  if (!encryptedData) return ''

  try {
    // Initialize libsodium
    await _sodium.ready

    const config = useRuntimeConfig()
    const encryptionKey = config.encryptionKey

    if (!encryptionKey || encryptionKey.length < 32) {
      throw createError({
        statusCode: 500,
        message: 'Encryption key is missing or invalid',
      })
    }

    // Convert encrypted data from base64
    const combined = _sodium.from_base64(encryptedData)

    // Extract nonce and cipher
    const nonce = combined.slice(0, _sodium.crypto_secretbox_NONCEBYTES)
    const cipher = combined.slice(_sodium.crypto_secretbox_NONCEBYTES)

    // Convert key to Uint8Array
    const keyBuffer = _sodium.from_base64(encryptionKey)

    // Decrypt
    const decrypted = _sodium.crypto_secretbox_open_easy(cipher, nonce, keyBuffer)

    // Return decrypted string
    return _sodium.to_string(decrypted)
  } catch (error) {
    console.error('Error decrypting data:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to decrypt data',
    })
  }
}

/**
 * Asymmetric encryption for client-side data
 */
export const encryptForServer = async (data: string): Promise<string> => {
  await initialize()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()
  const publicKey = config.public.encryption.publicKey

  if (!publicKey) {
    throw new Error('Public encryption key is missing')
  }

  const encrypted = sodium.crypto_box_seal(sodium.from_string(data), sodium.from_base64(publicKey))

  return sodium.to_base64(encrypted)
}

/**
 * Decrypts data encrypted with encryptForServer
 */
export const decryptFromClient = async (encryptedData: string): Promise<string> => {
  await initialize()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()
  const privateKey = config.encryption.privateKey

  if (!privateKey) {
    throw new Error('Private encryption key is missing')
  }

  const decrypted = sodium.crypto_box_seal_open(
    sodium.from_base64(encryptedData),
    sodium.from_base64(config.public.encryption.publicKey),
    sodium.from_base64(privateKey)
  )

  return sodium.to_string(decrypted)
}

/**
 * Symmetric encryption for server-side storage
 */
export const encryptForStorage = async (data: string): Promise<string> => {
  await initialize()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()
  const storageKey = config.storageEncryptionKey

  if (!storageKey) {
    throw new Error('Storage encryption key is missing')
  }

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const keyBuffer = sodium.from_base64(storageKey)
  const cipher = sodium.crypto_secretbox_easy(sodium.from_string(data), nonce, keyBuffer)

  // Combine nonce and cipher for storage
  const combined = new Uint8Array(nonce.length + cipher.length)
  combined.set(nonce)
  combined.set(cipher, nonce.length)

  return sodium.to_base64(combined)
}

/**
 * Decrypts data encrypted with encryptForStorage
 */
export const decryptFromStorage = async (encryptedData: string): Promise<string> => {
  await initialize()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()
  const storageKey = config.storageEncryptionKey

  if (!storageKey) {
    throw new Error('Storage encryption key is missing')
  }

  const combined = sodium.from_base64(encryptedData)
  const nonce = combined.slice(0, sodium.crypto_secretbox_NONCEBYTES)
  const cipher = combined.slice(sodium.crypto_secretbox_NONCEBYTES)
  const keyBuffer = sodium.from_base64(storageKey)

  const decrypted = sodium.crypto_secretbox_open_easy(cipher, nonce, keyBuffer)
  return sodium.to_string(decrypted)
}
