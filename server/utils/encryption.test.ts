import _sodium from 'libsodium-wrappers'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  decryptFromStorage,
  encryptForStorage,
  generateEncryptionKey,
  generatePrivatePublicKeyPair,
} from './encryption'

describe('Encryption Utils', () => {
  // Ensure sodium is initialized before tests
  beforeAll(async () => {
    await _sodium.ready
  })

  describe('generateEncryptionKey', () => {
    it('should generate a valid base64 encoded encryption key', async () => {
      const key = await generateEncryptionKey()

      // Check that the key is a non-empty string
      expect(key).toBeTruthy()
      expect(typeof key).toBe('string')

      // Check that it's a valid base64 string
      expect(() => Buffer.from(key, 'base64')).not.toThrow()

      // Check that it has the expected length (32 bytes = ~44 chars in base64)
      const decoded = Buffer.from(key, 'base64')
      expect(decoded.length).toBe(32)
    })
  })

  describe('generatePrivatePublicKeyPair', () => {
    it('should generate a valid key pair', async () => {
      const { privateKey, publicKey } = await generatePrivatePublicKeyPair()

      // Check that keys are non-empty strings
      expect(privateKey).toBeTruthy()
      expect(publicKey).toBeTruthy()
      expect(typeof privateKey).toBe('string')
      expect(typeof publicKey).toBe('string')

      // Check that they're valid base64 strings
      expect(() => Buffer.from(privateKey, 'base64')).not.toThrow()
      expect(() => Buffer.from(publicKey, 'base64')).not.toThrow()

      // Check that they have different values
      expect(privateKey).not.toBe(publicKey)
    })
  })

  describe('encryptForStorage and decryptFromStorage', () => {
    it('should correctly encrypt and decrypt data', async () => {
      const testData = 'This is a test string to encrypt and decrypt'

      // Encrypt the data
      const encrypted = await encryptForStorage(testData)

      // Check that encrypted data is different from original
      expect(encrypted).not.toBe(testData)

      // Decrypt the data
      const decrypted = await decryptFromStorage(encrypted)

      // Check that decrypted data matches original
      expect(decrypted).toBe(testData)
    })
  })
})
