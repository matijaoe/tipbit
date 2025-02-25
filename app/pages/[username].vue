<script lang="ts" setup>
const route = useRoute()
const username = computed(() => route.params.username as string)

definePageMeta({
  middleware: ['user'],
})

// Fetch user data directly - will return 404 if username doesn't exist
const { data: userData, status } = await useFetch(() => `/api/users/${username.value}`)
</script>

<template>
  <div>
    <div v-if="status === 'pending'">
      <p>Loading...</p>
    </div>
    <div v-else>
      <h1>Hello {{ username }}</h1>
      <pre>{{ userData }}</pre>
    </div>
  </div>
</template>
