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
  if (!connections.value?.length) {
    return undefined
  }

  return connections.value.find(
    (pref) => pref.connection?.serviceType === 'strike' && pref.connection?.strikeConnection
  )
})

const strikeHandle = computed(() => {
  return strikeConnection.value?.connection?.strikeConnection?.handle ?? undefined
})

const hasStrikeApiKey = computed(() => {
  return strikeConnection.value?.connection?.strikeConnection?.hasApiKey ?? false
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
          <div v-if="pref.connection?.serviceType === 'strike' && pref.connection.strikeConnection">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>{{ pref.connection.name }}</span>
              </div>
              <Badge v-if="pref.connection.strikeConnection.hasApiKey" variant="default">Receive request</Badge>
              <Badge v-else variant="outline">Invoice</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PaymentInvoice
      v-if="strikeConnection"
      class="mt-6"
      :profile-handle="profileData.handle"
      :strike-handle="strikeHandle"
      :connection-id="strikeConnection.id"
      :has-api-key="hasStrikeApiKey"
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
