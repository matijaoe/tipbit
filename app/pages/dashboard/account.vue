<script lang="ts" setup>
import { ArrowUpRight } from 'lucide-vue-next'
import type { AuthProvider } from '~~/shared/constants'

definePageMeta({
  layout: 'dashboard',
})

const { user } = useCurrentUser()

const authConnections = computed(() => user.value?.authConnections)
const profiles = computed(() => user.value?.profiles ?? [])
// Function to get provider display name
function getProviderName(provider: AuthProvider) {
  const names = {
    github: 'GitHub',
    google: 'Google',
    x: 'X (Twitter)',
    twitch: 'Twitch',
  }
  return names[provider] || provider
}
</script>

<template>
  <div class="space-y-8">
    <!-- Account Information Card -->
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-start gap-4">
          <Avatar size="xl" shape="square">
            <AvatarImage :src="user?.avatarUrl ?? ''" :alt="user?.id" />
            <AvatarFallback>
              {{ user?.id.charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>

          <div class="flex flex-1 flex-col gap-4">
            <div>
              <h3 class="text-sm font-medium">Account ID</h3>
              <p class="">{{ user?.id }}</p>
            </div>

            <div>
              <h3 class="text-sm font-medium">Role</h3>
              <Badge :variant="user?.role === 'ADMIN' ? 'default' : 'outline'">{{ user?.role }}</Badge>
            </div>

            <div v-if="user?.createdAt">
              <h3 class="text-sm font-medium">Member Since</h3>
              <p class="">
                {{
                  new Date(user?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                }}
              </p>
            </div>

            <div v-if="authConnections">
              <h3 class="text-sm font-medium">Auth</h3>
              <div class="mt-1 flex flex-wrap">
                <div v-for="connection in authConnections" :key="connection.id">
                  <Badge variant="secondary">{{ getProviderName(connection.provider) }}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>  
    </Card>

    <!-- Profiles Section -->
    <div>
      <h3 class="text-lg font-medium">Profiles</h3>
      <div class="mt-2 flex flex-col gap-4">
        <!-- Profile Cards -->
        <Card v-for="profile in profiles" :key="profile.id">
          <CardContent class="p-4">
            <div class="flex items-start gap-3">
              <!-- Profile Avatar -->
              <Avatar size="base">
                <AvatarImage
                  :src="profile.avatarUrl || user?.avatarUrl || '/default-avatar.png'"
                  :alt="`${profile.displayName}'s avatar`"
                />
                <AvatarFallback>
                  {{ profile.displayName.charAt(0).toUpperCase() }}
                </AvatarFallback>
              </Avatar>

              <div class="flex-1">
                <div class="flex w-full items-center justify-between">
                  <h3 class="text-base font-bold">{{ profile.displayName }}</h3>
                  <Badge v-if="profile.isPrimary"> Primary </Badge>
                </div>
                <NuxtLink
                  :to="{ name: 'handle', params: { handle: profile.handle } }"
                  class="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <p class="text-sm">@{{ profile.handle }}</p>
                  <ArrowUpRight class="size-4" />
                </NuxtLink>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
