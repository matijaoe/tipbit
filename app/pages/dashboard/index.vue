<script lang="ts" setup>
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, logout } = useAuth()

// Redirect non-authenticated users
onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo('/login')
  }
})

// Handle logout and navigation
const handleLogout = () => {
  logout()
  navigateTo('/login')
}
</script>

<template>
  <div>
    <h1 class="mb-4 text-2xl font-bold">Admin Dashboard</h1>

    <Card v-if="!isAuthenticated">
      <CardHeader>
        <CardTitle>You need to be authenticated to access this page.</CardTitle>
      </CardHeader>
      <CardContent>
        <Button @click="navigateTo('/login')">Login</Button>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader>
        <CardTitle>Welcome to your dashboard!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is your personal dashboard area.</p>
      </CardContent>
      <CardFooter>
        <Button @click="handleLogout">Logout</Button>
      </CardFooter>
    </Card>
  </div>
</template>
