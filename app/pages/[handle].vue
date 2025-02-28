<script lang="ts" setup>
import { useRouteParams } from '@vueuse/router'

const handle = useRouteParams('handle')

definePageMeta({
  middleware: ['user'],
  layout: 'public',
})

// Restrict info that is fetched
const { data: profileData } = await useFetch(() => `/api/profiles/${handle.value}`, {
  pick: ['id', 'handle', 'displayName', 'isPublic'],
})
</script>

<template>
  <div v-if="profileData">
    <h1>Hello {{ profileData?.displayName ?? 'Satoshi' }}</h1>
    <span class="text-sm text-muted-foreground">@{{ profileData?.handle }}</span>

    <Card class="mt-4">
      <CardHeader>
        <CardTitle>Profile data</CardTitle>
      </CardHeader>
      <CardContent>
        <pre>{{ profileData }}</pre>
      </CardContent>
    </Card>
  </div>
  <div v-else>
    <h1>Profile not found</h1>
  </div>
</template>
