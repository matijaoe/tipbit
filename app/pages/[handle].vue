<script lang="ts" setup>
import { createError } from '#imports'
import { useRouteParams } from '@vueuse/router'
import { ChevronDown } from 'lucide-vue-next'
import { computed } from 'vue'
import type { PaymentServiceType } from '~~/shared/payments/constants'

const handle = useRouteParams('handle')

definePageMeta({
  layout: 'public',
})

const { data: profileData } = await useFetch(() => `/api/profiles/${handle.value}`, {
  pick: ['id', 'handle', 'displayName', 'isPublic', 'avatarUrl'],
  key: `profile:${handle.value}`,
  dedupe: 'defer',
})

// Define the type for connection data
type ConnectionPreference = {
  id: string
  connection: {
    serviceType: PaymentServiceType
    name?: string
    strikeConnection?: {
      strikeProfileId: string
      hasApiKey: boolean
      handle: string
    }
  }
}

// Check if profile exists
if (!profileData.value) {
  throw createError({ statusCode: 404, message: 'Profile not found' })
}

// TODO: fetch only default (top) connection
// Only fetch connections for the existing profile
const { data: connections, status: connectionsStatus } = useLazyFetch<ConnectionPreference[]>(
  `/api/profiles/${profileData.value.id}/connections`,
  {
    key: `connections:${handle.value}`,
    default: () => [] as ConnectionPreference[],
  }
)

const isConnectionsLoading = computed(() => connectionsStatus.value === 'pending')

// Find the first active payment connection
const activeConnection = computed(() => {
  if (!connections.value?.length) {
    return undefined
  }

  return connections.value[0] // Just use the first connection for now
})

// Extract connection-specific data based on service type
const connectionData = computed(() => {
  if (!activeConnection.value?.connection) {
    return null
  }

  const { connection } = activeConnection.value

  // For now, only handle Strike connections
  if (connection.serviceType === 'strike' && connection.strikeConnection) {
    return {
      serviceType: 'strike' as const,
      handle: connection.strikeConnection.handle,
      hasApiKey: connection.strikeConnection.hasApiKey,
    }
  }

  return null
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

    <div v-if="connections?.length" class="mt-6">
      <h2 class="text-lg font-medium">Payment connections</h2>
      <div class="mt-2 space-y-2">
        <div v-for="pref in connections" :key="pref.id" class="rounded-lg border p-3">
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
    </div>

    <PaymentInvoice
      v-if="connectionData"
      class="mt-6"
      :profile-handle="profileData.handle"
      :connection-data="connectionData"
      :connection-id="activeConnection?.id"
    />

    <div v-else-if="isConnectionsLoading" class="mt-6 animate-pulse">
      <div class="h-40 rounded-md bg-muted"></div>
    </div>

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
            <h3>Profile</h3>
            <pre class="no-scrollbar overflow-auto">{{ profileData }}</pre>
          </CardContent>
          <CardContent class="pt-4">
            <h3>Connections</h3>
            <pre v-if="connections" class="no-scrollbar mt-4 overflow-auto">{{ connections }}</pre>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  </div>

  <div v-else>
    <p>Profile not found</p>
  </div>
</template>
