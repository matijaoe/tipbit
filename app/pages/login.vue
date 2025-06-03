<script lang="ts" setup>
import type { AuthProvider } from '~~/shared/constants/auth'

const { ready } = useUserSession()

const loadingProvider = ref<AuthProvider | null>(null)

const handleLogin = async (provider: AuthProvider) => {
  loadingProvider.value = provider
  navigateTo(`/api/auth/${provider}`, {
    external: true,
    replace: true,
  })
}

whenever(ready, () => {
  loadingProvider.value = null
  navigateTo('/dashboard')
})
</script>

<template>
  <div class="space-y-3">
    <Card class="max-w-xs">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-2">
          <Button :is-loading="loadingProvider === 'google'" @click="handleLogin('google')"> Login with Google </Button>
          <Button :is-loading="loadingProvider === 'github'" @click="handleLogin('github')"> Login with GitHub </Button>
          <Button :is-loading="loadingProvider === 'x'" @click="handleLogin('x')"> Login with X </Button>
          <Button :is-loading="loadingProvider === 'twitch'" @click="handleLogin('twitch')"> Login with Twitch </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
