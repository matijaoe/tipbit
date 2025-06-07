<script lang="ts" setup>
import { createError } from '#imports'
import { useRouteParams } from '@vueuse/router'
import { ChevronDown } from 'lucide-vue-next'
import { computed } from 'vue'
import type { UserPaymentPreference } from '~~/server/utils/db'
import type { SanitizedStrikeConnection } from '~~/server/utils/security'

const username = useRouteParams('username')

definePageMeta({
  layout: 'public',
})

const { data: userData } = await useFetch<User>(() => `/api/profile/${username.value}`, {
  pick: ['username', 'displayName', 'isPublic', 'avatarUrl'],
  key: `user:${username.value}`,
  dedupe: 'defer',
})

// Check if user exists
if (!userData.value) {
  throw createError({ statusCode: 404, message: 'User data not found' })
}

// TODO: extract somewhere
type Connection = UserPaymentPreference & {
  connection: PaymentConnection & {
    strikeConnection: SanitizedStrikeConnection<StrikeConnection>
  }
}

// TODO: fetch only top priority connection
// Only fetch connections for the existing user
const { data: connections, status: connectionsStatus } = useLazyFetch<Connection[]>(
  `/api/users/${userData.value.username}/connections`,
  {
    key: `connections:${username.value}`,
    default: () => [] as Connection[],
  }
)

const isConnectionsLoading = computed(() => connectionsStatus.value === 'pending')

// TODO: later maybe give choice of connection to user, if they are diferrent enough (lightning vs onchain vs ecash vs silent)
// TODO: return directly from server, don't fetch all
const activeConnection = computed(() => {
  if (!connections.value?.length) {
    return undefined
  }

  return connections.value.toSorted((a, b) => a.priority - b.priority).at(0)
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-multiple-template-root -->
  <template v-if="userData">
    <div class="flex items-center gap-3">
      <Avatar size="base" shape="square">
        <AvatarImage :src="userData?.avatarUrl ?? ''" />
        <AvatarFallback>{{ userData?.displayName?.charAt(0) ?? '' }}</AvatarFallback>
      </Avatar>

      <div>
        <h1>{{ userData?.displayName ?? '???' }}</h1>
        <span class="text-sm text-muted-foreground">@{{ userData?.username }}</span>
      </div>
    </div>

    <PaymentInvoice
      v-if="activeConnection"
      class="mt-6"
      :user-username="userData.username"
      :connection-data="activeConnection?.connection"
      :connection-id="activeConnection?.connection.id"
    />

    <div v-else-if="isConnectionsLoading" class="mt-6 animate-pulse">
      <div class="h-40 rounded-md bg-muted"></div>
    </div>

    <Collapsible class="mt-4">
      <CollapsibleTrigger as-child>
        <Button variant="link" size="sm" class="pl-0">
          Show payment connections
          <ChevronDown class="size-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card class="mt-4">
          <CardContent class="pt-4">
            <div v-if="connections?.length" class="space-y-2">
              <div v-for="pref in connections" :key="pref.id">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span>{{ pref.connection?.name ?? pref.connection?.serviceType }}</span>
                  </div>
                  <Badge
                    v-if="pref.connection"
                    :variant="pref.connection.strikeConnection?.hasApiKey ? 'default' : 'outline'"
                  >
                    {{ pref.connection.strikeConnection?.hasApiKey ? 'Receive request' : 'Invoice' }}
                  </Badge>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-muted-foreground">No payment connections found</div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>

    <Collapsible class="mt-4">
      <CollapsibleTrigger as-child>
        <Button variant="link" size="sm" class="pl-0">
          Show raw data
          <ChevronDown class="size-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card class="mt-4 overflow-hidden">
          <CardContent class="pt-4">
            <h3 class="text-sm font-medium text-green-500">User</h3>
            <pre class="no-scrollbar overflow-auto">{{ userData }}</pre>
          </CardContent>
          <CardContent class="pt-4">
            <h3 class="text-sm font-medium text-amber-500">Connections</h3>
            <pre v-if="connections" class="no-scrollbar mt-4 overflow-auto">{{ connections }}</pre>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  </template>
</template>
