<script lang="ts" setup>
defineProps<{
  profileHandle: string
  strikeHandle?: string
  connectionId?: string
  hasApiKey?: boolean
}>()
</script>

<template>
  <div>
    <!-- Use StrikePaymentRequest for users with API keys (supports both Lightning and on-chain) -->
    <StrikePaymentRequest
      v-if="hasApiKey && connectionId"
      :profile-handle="profileHandle"
      :connection-id="connectionId"
    />

    <!-- Use StrikeInvoice for users without API keys (Lightning only) -->
    <StrikeInvoice v-else-if="strikeHandle" :strike-handle="strikeHandle" />

    <div v-else>
      <p>No payment invoice data available</p>
    </div>
  </div>
</template>
