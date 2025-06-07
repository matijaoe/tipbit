<script lang="ts" setup>
interface Props {
  mode: 'register' | 'login'
}

const props = defineProps<Props>()

const isLoading = ref(false)
const error = ref<string | null>(null)

const { register, authenticate } = useWebAuthn({
  registerEndpoint: '/api/auth/webauthn/register',
  authenticateEndpoint: '/api/auth/webauthn/authenticate',
})

const generateRandomEmail = () => {
  const randomString = Math.random().toString(36).substring(2, 15)
  return `user-${randomString}@passkey.local`
}

const handlePasskeyAuth = async () => {
  isLoading.value = true
  error.value = null

  try {
    let success = false
    
    if (props.mode === 'register') {
      const userName = generateRandomEmail()
      console.log('Attempting passkey registration for:', userName)
      success = await register({
        userName,
        displayName: `User ${userName.split('@')[0]}`,
      })
      console.log('Registration result:', success)
    } else {
      // For login, we need to prompt for the email or use the browser's credential manager
      const userName = prompt('Enter your email:')
      if (!userName) {
        error.value = 'Email is required for login'
        return
      }

      console.log('Attempting passkey authentication for:', userName)
      success = await authenticate(userName)
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
    <Button
      :disabled="isLoading"
      class="w-full"
      @click="handlePasskeyAuth"
    >
      <span v-if="isLoading">
        {{ mode === 'register' ? 'Creating Passkey...' : 'Authenticating...' }}
      </span>
      <span v-else>
        {{ mode === 'register' ? 'Register with Passkey' : 'Login with Passkey' }}
      </span>
    </Button>

    <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
      {{ error }}
    </div>

    <div v-if="mode === 'register'" class="text-xs text-gray-500">
      A random email will be generated for your passkey account
    </div>
  </div>
</template>