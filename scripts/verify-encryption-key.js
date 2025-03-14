// Simple script to verify an encryption key
import _sodium from 'libsodium-wrappers'

// Get the key from the .env file
import fs from 'fs'

const verifyKey = async (key) => {
  try {
    await _sodium.ready
    console.log('Libsodium initialized successfully')

    if (!key) {
      console.error('No encryption key provided')
      return false
    }

    console.log(`Key length: ${key.length}`)

    // Try to decode the key from base64
    try {
      const keyBuffer = _sodium.from_base64(key)
      console.log(`Successfully decoded key to buffer of length: ${keyBuffer.length}`)
      return true
    } catch (error) {
      console.error('Failed to decode base64 key:', error)
      return false
    }
  } catch (error) {
    console.error('Error verifying key:', error)
    return false
  }
}

const main = async () => {
  try {
    const envContent = fs.readFileSync('.env', 'utf8')
    const keyMatch = envContent.match(/NUXT_ENCRYPTION_KEY=(.+)/)

    if (!keyMatch) {
      console.error('Could not find NUXT_ENCRYPTION_KEY in .env file')
      process.exit(1)
    }

    const key = keyMatch[1].trim()
    console.log('Found encryption key in .env file')

    const isValid = await verifyKey(key)

    if (isValid) {
      console.log('✅ Encryption key is valid')
      process.exit(0)
    } else {
      console.error('❌ Encryption key is invalid')
      process.exit(1)
    }
  } catch (error) {
    console.error('Error reading .env file:', error)
    process.exit(1)
  }
}

main()
