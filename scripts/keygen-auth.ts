import { generateEncryptionKey } from '../server/utils/encryption'
import { checkExistingEnvKey } from './utils/check-existing-env'

const ENV_KEY = {
  key: 'NUXT_SESSION_PASSWORD',
} as const

async function main() {
  try {
    checkExistingEnvKey(ENV_KEY.key)

    const sessionKey = await generateEncryptionKey()

    console.log('\nSession Password:')
    console.log('\x1b[32m%s\x1b[0m', sessionKey)

    console.log('\nAdd to .env:')
    console.log('\x1b[36m%s\x1b[0m', `${ENV_KEY.key}=${sessionKey}`)

    console.log('\nPurpose: Secures user sessions and authentication tokens')
    console.log('Note: Must be at least 32 characters long\n')
  } catch (error) {
    console.error('Failed to generate session password:', error)
    process.exit(1)
  }
}

main()
