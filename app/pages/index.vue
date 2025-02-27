<script lang="ts" setup>
const { loggedIn } = useUserSession()

// Redirect to dashboard if logged in
onMounted(() => {
  if (loggedIn.value) {
    navigateTo('/dashboard')
  }
})
</script>
