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
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-3">
          <PasskeyAuth mode="register" />

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Button :is-loading="loadingProvider === 'google'" @click="handleLogin('google')">
              Register with Google
            </Button>
            <Button :is-loading="loadingProvider === 'github'" @click="handleLogin('github')">
              Register with GitHub
            </Button>
            <Button :is-loading="loadingProvider === 'x'" @click="handleLogin('x')"> Register with X </Button>
            <Button :is-loading="loadingProvider === 'twitch'" @click="handleLogin('twitch')">
              Register with Twitch
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
