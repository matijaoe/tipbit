<script lang="ts" setup>
const { openInPopup, loggedIn, user, ready } = useUserSession()

const handleLogin = async () => {
  openInPopup('/api/auth/github', {
    width: 500,
    height: 500,
  })
}

whenever(user, () => {
  navigateTo('/dashboard')
})
</script>

<template>
  <div>
    <p>Logged in: {{ loggedIn }}</p>
    <Button @click="handleLogin">Login with Github</Button>
    <pre>{{ user }}</pre>
  </div>
</template>
