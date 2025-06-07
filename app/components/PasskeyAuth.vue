<script lang="ts" setup>
import { humanId } from 'human-id'

interface Props {
  mode: 'register' | 'login'
}

const props = defineProps<Props>()

const isLoading = ref(false)
const error = ref<string | null>(null)

const { register, authenticate } = useWebAuthn({
  registerEndpoint: '/api/auth/webauthn/register',
  authenticateEndpoint: '/api/auth/webauthn/authenticate',
  useBrowserAutofill: false, // Disable autofill to use manual credential picker
})

// TODO: should not auto generate username. should ask user and validate uniqueness
const generateRandomUsername = () => {
  return humanId({
    separator: '_',
    capitalize: false,
  })
}

const handlePasskeyAuth = async () => {
  isLoading.value = true
  error.value = null

  try {
    let success = false

    if (props.mode === 'register') {
      const userName = generateRandomUsername()
      console.log('Attempting passkey registration for:', userName)
      success = await register({
        userName,
        displayName: `User ${userName}`,
      })
      console.log('Registration result:', success)
    } else {
      // Usernameless authentication - pass undefined to indicate no specific user
      console.log('Attempting usernameless passkey authentication')
      success = await authenticate(undefined)
      console.log('Authentication result:', success)
    }

    console.log('Success status:', success)
    if (success) {
      console.log('Auth successful, clearing cache and redirecting...')
      // Clear any existing user data cache and redirect
      await clearNuxtData('user')
      await refreshCookie('nuxt-session')
      console.log('About to navigate to dashboard...')

      // Force a full page reload to ensure session is properly read
      window.location.href = '/dashboard'
    } else {
      console.log('Auth failed, success was false')
      error.value = 'Authentication failed'
    }
  } catch (err: unknown) {
    console.error('PasskeyAuth error:', err)
    error.value = (err as { data?: { message?: string } })?.data?.message || 'Authentication failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <Button :disabled="isLoading" class="w-full" @click="handlePasskeyAuth">
      <span v-if="isLoading">
        {{ mode === 'register' ? 'Creating Passkey...' : 'Authenticating...' }}
      </span>
      <span v-else>
        {{ mode === 'register' ? 'Create Passkey Account' : 'Sign in with Passkey' }}
      </span>
    </Button>

    <div v-if="error" class="rounded bg-red-50 p-2 text-sm text-red-600">
      {{ error }}
    </div>

    <div v-if="mode === 'register'" class="text-xs text-gray-500">
      Creates a secure passkey account with no passwords required
    </div>
    <div v-else class="text-xs text-gray-500">Choose from your saved passkeys</div>
  </div>
</template>
