// Generate a secure encryption key using libsodium
import _sodium from 'libsodium-wrappers'

const main = async () => {
  try {
    // Initialize libsodium
    await _sodium.ready
    console.log('Libsodium initialized successfully')

    // Generate a random key using libsodium (not Node's crypto)
    const keyBytes = _sodium.randombytes_buf(_sodium.crypto_secretbox_KEYBYTES)
    const base64Key = _sodium.to_base64(keyBytes)

    console.log('Generated a secure encryption key using libsodium:')
    console.log(base64Key)
    console.log('\nKey length:', base64Key.length)
    console.log('\nUpdate your .env file with:')
    console.log(`NUXT_ENCRYPTION_KEY=${base64Key}`)

    // Verify the key can be decoded
    try {
      // eslint-disable-next-line no-unused-vars
      const decodedKey = _sodium.from_base64(base64Key)
      console.log('\n✅ Verification successful: Key can be decoded by libsodium')
    } catch (error) {
      console.error('\n❌ Verification failed: Key cannot be decoded by libsodium', error)
    }
  } catch (error) {
    console.error('Error generating key:', error)
  }
}

main()
