<script lang="ts" setup>
const { data: users } = useFetch('/api/users')
</script>

<template>
  <div>
    <h1>Super Admin</h1>
    <Card>
      <template #header>
        <h2>Users</h2>
      </template>
      <pre>{{ users }}</pre>
    </Card>
  </div>
</template>
