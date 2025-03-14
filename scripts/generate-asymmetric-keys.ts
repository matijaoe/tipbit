#!/usr/bin/env tsx

import _sodium from 'libsodium-wrappers'

async function main() {
  await _sodium.ready
  const sodium = _sodium

  // Generate key pair
  const keyPair = sodium.crypto_box_keypair()

  console.log('\nAsymmetric Encryption Keys Generated Successfully:')
  console.log('\nPublic Key (NUXT_ENCRYPTION_PUBLIC_KEY):')
  console.log('\x1b[32m%s\x1b[0m', sodium.to_base64(keyPair.publicKey))
  console.log('\nPrivate Key (NUXT_ENCRYPTION_PRIVATE_KEY):')
  console.log('\x1b[31m%s\x1b[0m', sodium.to_base64(keyPair.privateKey))
  console.log('\nAdd these values to your .env file:')
  console.log('\x1b[36m%s\x1b[0m', 'NUXT_ENCRYPTION_PUBLIC_KEY=' + sodium.to_base64(keyPair.publicKey))
  console.log('\x1b[36m%s\x1b[0m', 'NUXT_ENCRYPTION_PRIVATE_KEY=' + sodium.to_base64(keyPair.privateKey))
  console.log('\nThese keys are used for client-server encryption.\n')
}

main().catch((error) => {
  console.error('Error generating asymmetric keys:', error)
  process.exit(1)
})
