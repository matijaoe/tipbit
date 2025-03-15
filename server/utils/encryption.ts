import _sodium from 'libsodium-wrappers'

let sodium: typeof _sodium | null = null

// Initialize libsodium (called automatically on first use)
const initializeSodium = async () => {
  if (!sodium) {
    await _sodium.ready
    sodium = _sodium
  }
}

/**
 * Generates a cryptographically secure encryption key encoded as base64.
 *
 * @remarks
 * This function should be used to generate the NUXT_ENCRYPTION_KEY environment variable.
 * The generated key meets the minimum security requirements for libsodium's secretbox encryption.
 *
 * @returns {Promise<string>} A base64-encoded encryption key
 * @throws {Error} If libsodium initialization fails
 *
 * @example
 * ```ts
 * const key = await generateEncryptionKey()
 * // => "h_QeVhXHrjhPiY29HkEehg2CxQUQY5YdICeqvXhV0P4="
 * ```
 */
export const generateEncryptionKey = async (): Promise<string> => {
  await initializeSodium()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const keyBytes = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)
  return sodium.to_base64(keyBytes)
}

export const generatePrivatePublicKeyPair = async (): Promise<{ privateKey: string; publicKey: string }> => {
  await initializeSodium()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const keyPair = sodium.crypto_box_keypair()
  return {
    privateKey: _sodium.to_base64(keyPair.privateKey),
    publicKey: _sodium.to_base64(keyPair.publicKey),
  }
}

/**
 * Encrypts data using asymmetric encryption for client-to-server communication.
 *
 * @remarks
 * Uses libsodium's crypto_box_seal for public key encryption. The server must have
 * the corresponding private key to decrypt the data.
 *
 * @param {string} data - The plaintext data to encrypt
 * @returns {Promise<string>} Base64-encoded encrypted data
 * @throws {Error} If libsodium initialization fails
 * @throws {Error} If public encryption key is missing from configuration
 *
 * @example
 * ```ts
 * const encrypted = await encryptForServer('sensitive data')
 * // Send to server: await $fetch('/api/endpoint', { body: { data: encrypted } })
 * ```
 */
export const encryptForServer = async (data: string): Promise<string> => {
  await initializeSodium()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()

  if (!config.public.transitPublicKey) {
    throw new Error('Public encryption key is missing')
  }

  const encrypted = sodium.crypto_box_seal(sodium.from_string(data), sodium.from_base64(config.public.transitPublicKey))

  return sodium.to_base64(encrypted)
}

/**
 * Decrypts data that was encrypted using encryptForServer.
 *
 * @remarks
 * This function should only be used on the server side as it requires the private key.
 * Uses libsodium's crypto_box_seal_open for decryption.
 *
 * @param {string} encryptedData - Base64-encoded encrypted data
 * @returns {Promise<string>} Decrypted plaintext
 * @throws {Error} If libsodium initialization fails
 * @throws {Error} If private encryption key is missing from configuration
 * @throws {Error} If decryption fails (invalid data or wrong key)
 *
 * @example
 * ```ts
 * try {
 *   const decrypted = await decryptFromClient(encryptedData)
 * } catch (error) {
 *   console.error('Failed to decrypt client data:', error)
 * }
 * ```
 */
export const decryptFromClient = async (encryptedData: string): Promise<string> => {
  await initializeSodium()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()

  if (!config.transitPrivateKey) {
    throw new Error('Private encryption key is missing')
  }

  const decrypted = sodium.crypto_box_seal_open(
    sodium.from_base64(encryptedData),
    sodium.from_base64(config.public.transitPublicKey),
    sodium.from_base64(config.transitPrivateKey)
  )

  return sodium.to_string(decrypted)
}

/**
 * Encrypts data for secure storage using symmetric encryption.
 *
 * @remarks
 * Uses libsodium's secretbox encryption with a random nonce.
 * The nonce is prepended to the encrypted data for storage.
 * This is suitable for storing sensitive data in the database.
 *
 * @param {string} data - The plaintext data to encrypt
 * @returns {Promise<string>} Base64-encoded encrypted data with nonce
 * @throws {Error} If libsodium initialization fails
 * @throws {Error} If storage encryption key is missing from configuration
 *
 * @example
 * ```ts
 * // Encrypt sensitive data before storing in database
 * const apiKey = 'sk_live_...'
 * const encrypted = await encryptForStorage(apiKey)
 * await db.insert({ encryptedApiKey: encrypted })
 * ```
 */
export const encryptForStorage = async (data: string): Promise<string> => {
  await initializeSodium()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()

  if (!config.storageEncryptionKey) {
    throw new Error('Storage encryption key is missing')
  }

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const keyBuffer = sodium.from_base64(config.storageEncryptionKey)
  const cipher = sodium.crypto_secretbox_easy(sodium.from_string(data), nonce, keyBuffer)

  // Combine nonce and cipher for storage
  const combined = new Uint8Array(nonce.length + cipher.length)
  combined.set(nonce)
  combined.set(cipher, nonce.length)

  return sodium.to_base64(combined)
}

/**
 * Decrypts data that was encrypted using encryptForStorage.
 *
 * @remarks
 * Extracts the nonce from the combined data and uses it with the storage key
 * to decrypt the data. The nonce is expected to be the first 24 bytes of
 * the decoded data.
 *
 * @param {string} encryptedData - Base64-encoded encrypted data with prepended nonce
 * @returns {Promise<string>} Decrypted plaintext
 * @throws {Error} If libsodium initialization fails
 * @throws {Error} If storage encryption key is missing from configuration
 * @throws {Error} If decryption fails (invalid data, wrong key, or corrupted nonce)
 *
 * @example
 * ```ts
 * // Retrieve and decrypt sensitive data from database
 * const { encryptedApiKey } = await db.select().from('credentials').first()
 * try {
 *   const apiKey = await decryptFromStorage(encryptedApiKey)
 * } catch (error) {
 *   console.error('Failed to decrypt stored data:', error)
 * }
 * ```
 */
export const decryptFromStorage = async (encryptedData: string): Promise<string> => {
  await initializeSodium()

  if (!sodium) {
    throw new Error('Libsodium initialization failed')
  }

  const config = useRuntimeConfig()

  if (!config.storageEncryptionKey) {
    throw new Error('Storage encryption key is missing')
  }

  const combined = sodium.from_base64(encryptedData)
  const nonce = combined.slice(0, sodium.crypto_secretbox_NONCEBYTES)
  const cipher = combined.slice(sodium.crypto_secretbox_NONCEBYTES)
  const keyBuffer = sodium.from_base64(config.storageEncryptionKey)

  const decrypted = sodium.crypto_secretbox_open_easy(cipher, nonce, keyBuffer)
  return sodium.to_string(decrypted)
}
