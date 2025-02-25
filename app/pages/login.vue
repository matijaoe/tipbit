<script lang="ts" setup>
import { useAuth } from '~/composables/useAuth'

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const { login, isAuthenticated } = useAuth()

// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/')
  }
})

const handleLogin = async () => {
  errorMessage.value = ''

  if (!username.value || !password.value) {
    errorMessage.value = 'Please enter both username and password'
    return
  }

  const result = await login(username.value, password.value)

  if (result?.success) {
    // Redirect to home page after successful login
    navigateTo('/')
  } else {
    errorMessage.value = result?.message || 'Login failed'
  }
}
</script>

<template>
  <div>
    <Input v-model="username" type="text" placeholder="Username" />
    <Input v-model="password" type="password" placeholder="Password" data-1p-ignore />
    <Button @click="handleLogin">Login</Button>
    <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
  </div>
</template>
