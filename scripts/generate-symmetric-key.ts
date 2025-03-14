#!/usr/bin/env tsx

import _sodium from 'libsodium-wrappers'

async function main() {
  await _sodium.ready
  const sodium = _sodium

  // Generate symmetric key
  const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)

  console.log('\nSymmetric Encryption Key Generated Successfully:')
  console.log('\x1b[32m%s\x1b[0m', sodium.to_base64(key))
  console.log('\nAdd this value to your .env file:')
  console.log('\x1b[36m%s\x1b[0m', 'NUXT_STORAGE_ENCRYPTION_KEY=' + sodium.to_base64(key))
  console.log('\nThis key is used for server-side data encryption.\n')
}

main().catch((error) => {
  console.error('Error generating symmetric key:', error)
  process.exit(1)
})
