<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
})

const { data: users } = await useFetch('/api/users')
</script>

<template>
  <div>
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <pre>{{ users }}</pre>
      </CardContent>
    </Card>
  </div>
</template>
