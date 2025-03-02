<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useRouteParams } from '@vueuse/router'

const handle = useRouteParams('handle')

definePageMeta({
  layout: 'public',
})

const { data: profileData } = await useFetch(() => `/api/profiles/${handle.value}`, {
  pick: ['id', 'handle', 'displayName', 'isPublic', 'avatarUrl'],
  key: `profile:${handle.value}`,
  dedupe: 'defer',
})
</script>

<template>
  <div v-if="profileData">
    <div class="flex items-center gap-3">
      <Avatar size="base" shape="square">
        <AvatarImage :src="profileData?.avatarUrl ?? ''" />
        <AvatarFallback>{{ profileData?.displayName?.charAt(0) ?? '' }}</AvatarFallback>
      </Avatar>

      <div>
        <h1>{{ profileData?.displayName ?? '???' }}</h1>
        <span class="text-sm text-muted-foreground">@{{ profileData?.handle }}</span>
      </div>
    </div>

    <Card class="mt-4 overflow-hidden">
      <CardContent class="pt-4">
        <pre class="no-scrollbar overflow-auto">{{ profileData }}</pre>
      </CardContent>
    </Card>
  </div>
  <div v-else>
    <p>Profile not found</p>
  </div>
</template>
