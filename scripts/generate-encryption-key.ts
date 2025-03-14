#!/usr/bin/env tsx

import { generateEncryptionKey } from '../server/utils/encryption'

/**
 * Command-line utility to generate a secure encryption key for use in environment variables
 * Usage: pnpm tsx scripts/generate-encryption-key.ts
 */
async function main() {
  try {
    const encryptionKey = await generateEncryptionKey()
    console.log('\nEncryption Key Generated Successfully:')
    console.log('\x1b[32m%s\x1b[0m', encryptionKey)
    console.log('\nAdd this value to your .env file as:')
    console.log('\x1b[36m%s\x1b[0m', 'NUXT_ENCRYPTION_KEY=' + encryptionKey)
    console.log('\nThis key is used to encrypt sensitive data like API keys.\n')
  } catch (error) {
    console.error('Error generating encryption key:', error)
    process.exit(1)
  }
}

main()
