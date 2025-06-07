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

// Find the first Strike connection (if any)
const strikeConnection = computed(() => {
  if (!connections.value?.length) return undefined

  return connections.value.find(
    (pref) => pref.connection?.serviceType === 'strike' && pref.connection?.strikeConnection
  )
})

// Get the Strike handle for the components
const strikeHandle = computed(() => {
  const connection = strikeConnection.value
  // Try to get the handle from the connection first (new connections)
  if (connection?.connection?.strikeConnection?.handle) {
    return connection.connection.strikeConnection.handle
  }

  // TODO: dont do this
  // For legacy connections without handle, extract it from the name
  if (connection?.connection?.name) {
    // Extract handle from format "Strike (handle)"
    const match = connection.connection.name.match(/Strike \((.+)\)/)
    if (match) {
      return match[1]
    }
  }

  return undefined
})

// Check if Strike connection has API key for receive requests
const hasStrikeApiKey = computed(() => {
  return strikeConnection.value?.connection?.strikeConnection?.hasApiKey ?? false
})

// Get connection ID for receive requests
const strikeConnectionId = computed(() => {
  return strikeConnection.value?.id
})

watchEffect(() => {
  console.log('profileData', profileData.value)
  console.log('preferences', connections.value)
  console.log('strikeConnection', strikeConnection.value)
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
      <h2 class="text-lg font-medium">Payment Methods</h2>
      <div class="mt-2 space-y-2">
        <div v-for="pref in connections" :key="pref.id" class="rounded border p-3">
          <div v-if="pref.connection?.serviceType === 'strike'">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>{{ pref.connection.name || 'Strike' }}</span>
              </div>
              <div v-if="pref.connection.strikeConnection?.strikeProfileId" class="text-sm text-muted-foreground">
                ID: {{ pref.connection.strikeConnection.strikeProfileId }}
              </div>
            </div>
          </div>

          <div v-else-if="pref.connection?.serviceType === 'coinos'">
            <div class="flex items-center gap-2">
              <span>{{ pref.connection.name || 'Coinos' }}</span>
            </div>
          </div>

          <div v-else-if="pref.connection?.serviceType === 'alby'">
            <div class="flex items-center gap-2">
              <span>{{ pref.connection.name || 'Alby' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="isConnectionsLoading" class="mt-6">
      <h2 class="text-lg font-medium">Payment Methods</h2>
      <div class="mt-2 space-y-2">
        <div v-for="i in 2" :key="i" class="animate-pulse rounded border p-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-6 w-6 rounded-full bg-muted"></div>
              <div class="h-5 w-24 rounded bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!isConnectionsLoading" class="mt-6">
      <h2 class="text-lg font-medium">Payment Methods</h2>
      <div class="mt-2">
        <p class="text-muted-foreground">No payment methods connected</p>
      </div>
    </div>

    <Payment
      v-if="strikeHandle"
      class="mt-6"
      :handle="strikeHandle"
      :connection-id="strikeConnectionId"
      :has-api-key="hasStrikeApiKey"
    />

    <!-- Loading state for Payment -->
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
            <pre class="no-scrollbar overflow-auto">{{ profileData }}</pre>
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
