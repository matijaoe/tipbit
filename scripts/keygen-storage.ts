#!/usr/bin/env tsx

import { generateEncryptionKey } from '../server/utils/encryption'
import { checkExistingEnvKey } from './utils/check-existing-env'

const ENV_KEY = {
  key: 'NUXT_STORAGE_ENCRYPTION_KEY',
} as const

/**
 * Command-line utility to generate a secure encryption key for use in environment variables
 * Usage: pnpm tsx scripts/keygen-storage.ts
 */
async function main() {
  checkExistingEnvKey(ENV_KEY.key)

  const encryptionKey = await generateEncryptionKey()

  console.log('\nStorage encryption key:')
  console.log('\x1b[32m%s\x1b[0m', encryptionKey)

  console.log('\nAdd to .env:')
  console.log('\x1b[36m%s\x1b[0m', `${ENV_KEY.key}=${encryptionKey}`)

  console.log('\nPurpose: Encrypts sensitive data at rest (API keys, credentials)')
  console.log('Note: Store securely and maintain backup\n')
}

main().catch((error) => {
  console.error('Error generating storage encryption key:', error)
  process.exit(1)
})
