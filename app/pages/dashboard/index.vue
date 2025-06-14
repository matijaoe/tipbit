<script lang="ts" setup>
const { user } = useUserSession()

definePageMeta({
  layout: 'dashboard',
})

const identifier = computed(() => user.value?.identifier)
const isEmail = computed(() => user.value?.identifier.includes('@'))
</script>

<template>
  <div>
    <h2 class="mb-4 text-xl font-semibold">Dashboard Overview</h2>

    <Card>
      <CardHeader>
        <CardTitle>Welcome to your dashboard!</CardTitle>
      </CardHeader>
      <CardContent>
        <p v-if="user" class="text-muted-foreground">
          {{ isEmail ? identifier : `@${identifier}` }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
