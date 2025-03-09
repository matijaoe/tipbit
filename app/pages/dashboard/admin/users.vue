<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
})

const { data: users } = await useFetch('/api/users', {
  key: 'users',
})
</script>

<template>
  <div class="max-w-lg space-y-8">
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <pre class="no-scrollbar overflow-auto">{{ users }}</pre>
      </CardContent>
    </Card>
  </div>
</template>
