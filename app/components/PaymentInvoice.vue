<script lang="ts" setup>
type ConnectionData = {
  serviceType: 'strike'
  handle: string
  hasApiKey: boolean
}

defineProps<{
  profileHandle: string
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
        v-if="connectionData.hasApiKey && connectionId"
        :profile-handle="profileHandle"
        :connection-id="connectionId"
      />

      <!-- Use StrikeInvoice for users without API keys (Lightning only) -->
      <StrikeInvoice v-else :strike-handle="connectionData.handle" />
    </template>

    <!-- Future: Other payment service types can be added here -->

    <div v-if="!connectionData">
      <p>No payment connection available</p>
    </div>
  </div>
</template>
