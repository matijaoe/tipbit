#!/usr/bin/env tsx

import { generatePrivatePublicKeyPair } from '../server/utils/encryption'
import { checkExistingEnvKey } from './utils/check-existing-env'

const ENV_KEY = {
  publicKey: 'NUXT_PUBLIC_TRANSIT_PUBLIC_KEY',
  privateKey: 'NUXT_TRANSIT_PRIVATE_KEY',
} as const

/**
 * Command-line utility to generate a secure encryption key for use in environment variables
 * Usage: pnpm tsx scripts/keygen-transit.ts
 */
async function main() {
  checkExistingEnvKey(ENV_KEY.publicKey)
  checkExistingEnvKey(ENV_KEY.privateKey)

  const { publicKey, privateKey } = await generatePrivatePublicKeyPair()

  console.log('\nTransit Key Pair:')
  console.log('\nPublic Key:')
  console.log('\x1b[32m%s\x1b[0m', publicKey)
  console.log('\nPrivate Key:')
  console.log('\x1b[31m%s\x1b[0m', privateKey)

  console.log('\nAdd to .env:')
  console.log('\x1b[36m%s\x1b[0m', `${ENV_KEY.publicKey}=${publicKey}`)
  console.log('\x1b[36m%s\x1b[0m', `${ENV_KEY.privateKey}=${privateKey}`)

  console.log('\nPurpose: Encrypts sensitive data in transit (client to server)')
  console.log('Note: Keep private key secure, public key can be shared\n')
}

main().catch((error) => {
  console.error('Failed to generate transit key pair:', error)
  process.exit(1)
})
