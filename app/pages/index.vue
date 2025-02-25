<script la ng="ts" setup>
const username = ref('')
</script>

<template>
  <div>
    <Card>
      <CardHeader>
        <CardTitle>Home</CardTitle>
      </CardHeader>
      <CardContent class="flex gap-2">
        <Input v-model="username" type="text" />
        <Button @click="navigateTo(`/${username}`)">Go</Button>
      </CardContent>
    </Card>
  </div>
</template>
