<script lang="ts" setup>
import type { SanitizedStrikeConnection } from '~~/server/utils/security'

type ConnectionData = PaymentConnection & {
  strikeConnection: SanitizedStrikeConnection<StrikeConnection>
}

defineProps<{
  userUsername: string
  connectionData: ConnectionData
  connectionId?: string
}>()
</script>

<template>
  <div>
    <!-- For Strike connections -->
    <template v-if="connectionData.serviceType === 'strike'">
      <!-- Use StrikePaymentRequest for users with API keys (supports both Lightning and on-chain) -->
      <StrikePaymentRequest
        v-if="connectionData.strikeConnection.hasApiKey && connectionId"
        :user-username="userUsername"
        :connection-id="connectionId"
      />

      <!-- Use StrikeInvoice for users without API keys (Lightning only) -->
      <StrikeInvoice
        v-else-if="connectionData.strikeConnection.handle"
        :strike-handle="connectionData.strikeConnection.handle"
      />

      <div v-else>
        <p>No required Strike profile data available</p>
      </div>
    </template>

    <!-- Future: Other payment service types can be added here -->

    <div v-if="!connectionData">
      <p>No payment connection available</p>
    </div>
  </div>
</template>
