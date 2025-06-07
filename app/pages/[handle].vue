<script lang="ts" setup>
import { createError } from '#imports'
import { useRouteParams } from '@vueuse/router'
import { ChevronDown } from 'lucide-vue-next'
import { computed } from 'vue'
import type { ProfilePaymentPreference } from '~~/server/utils/db'
import type { SanitizedStrikeConnection } from '~~/server/utils/security'

const handle = useRouteParams('handle')

definePageMeta({
  layout: 'public',
})

const { data: profileData } = await useFetch(() => `/api/profiles/${handle.value}`, {
  pick: ['id', 'handle', 'displayName', 'isPublic', 'avatarUrl'],
  key: `profile:${handle.value}`,
  dedupe: 'defer',
})

// Check if profile exists
if (!profileData.value) {
  throw createError({ statusCode: 404, message: 'Profile not found' })
}

// TODO: extract somewhere
type Connection = ProfilePaymentPreference & {
  connection: PaymentConnection & {
    strikeConnection: SanitizedStrikeConnection<StrikeConnection>
  }
}

// TODO: fetch only top priority connection
// Only fetch connections for the existing profile
const { data: connections, status: connectionsStatus } = useLazyFetch<Connection[]>(
  `/api/profiles/${profileData.value.id}/connections`,
  {
    key: `connections:${handle.value}`,
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
  <template v-if="profileData">
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

    <PaymentInvoice
      v-if="activeConnection"
      class="mt-6"
      :profile-handle="profileData.handle"
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
            <h3 class="text-sm font-medium text-green-500">Profile</h3>
            <pre class="no-scrollbar overflow-auto">{{ profileData }}</pre>
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
