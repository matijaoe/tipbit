<script lang="ts" setup>
const { user } = useUserSession()

definePageMeta({
  layout: 'dashboard',
})
</script>

<template>
  <div class="max-w-lg">
    <h2 class="mb-4 text-xl font-semibold">Dashboard Overview</h2>

    <Card>
      <CardHeader>
        <CardTitle>Welcome to your dashboard!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is your personal dashboard area.</p>
        <p v-if="user">Logged in as: @{{ user.username }}</p>
      </CardContent>
    </Card>
  </div>
</template>
