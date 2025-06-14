<script lang="ts" setup>
import { ArrowUpRight } from 'lucide-vue-next'
import type { AuthProvider } from '~~/shared/constants/auth'

definePageMeta({
  layout: 'dashboard',
})

const { user } = useCurrentUser()

const authConnections = computed(() => user.value?.authConnections)

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
              <h3 class="text-sm font-medium">Identifier</h3>
              <p>{{ user?.identifier }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium">Username</h3>
              <p class="">@{{ user?.username }}</p>
            </div>

            <div>
              <h3 class="text-sm font-medium">Display Name</h3>
              <p class="">{{ user?.displayName }}</p>
            </div>

            <div>
              <h3 class="text-sm font-medium">Account ID</h3>
              <p class="text-xs text-muted-foreground">{{ user?.id }}</p>
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

            <div>
              <h3 class="text-sm font-medium">Auth</h3>
              <div class="mt-1 flex flex-wrap">
                <div v-for="connection in authConnections" :key="connection.id">
                  <Badge variant="secondary">{{ getProviderName(connection.provider) }}</Badge>
                </div>
                <div v-if="!authConnections?.length">
                  <Badge variant="secondary">Passkey</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Public Profile Section -->
    <Card>
      <CardHeader>
        <CardTitle>Public Profile</CardTitle>
        <CardDescription> Your public profile information that others can see. </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-start gap-4">
          <Avatar size="xl" shape="square">
            <AvatarImage
              :src="user?.avatarUrl || '/default-avatar.png'"
              :alt="`${user?.displayName || user?.username}'s avatar`"
            />
            <AvatarFallback>
              {{ (user?.displayName || user?.username || '?').charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>

          <div class="flex-1">
            <div class="mb-3">
              <h3 class="text-lg font-semibold">{{ user?.displayName || user?.username }}</h3>
              <NuxtLink
                :to="`/${user?.username}`"
                class="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <p class="text-sm">@{{ user?.username }}</p>
                <ArrowUpRight class="size-4" />
              </NuxtLink>
            </div>

            <div class="space-y-2 text-sm">
              <div>
                <span class="font-medium">Visibility:</span>
                <Badge :variant="user?.isPublic ? 'default' : 'secondary'" class="ml-2">
                  {{ user?.isPublic ? 'Public' : 'Private' }}
                </Badge>
              </div>
              <p class="text-muted-foreground">
                {{
                  user?.isPublic
                    ? 'Your profile is visible to everyone.'
                    : 'Your profile is private and only visible to you.'
                }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
