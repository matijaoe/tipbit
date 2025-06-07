<script lang="ts" setup>
const props = defineProps<{
  handle: string
  connectionId?: string
  hasApiKey: boolean
}>()
</script>

<template>
  <!-- Use StrikePaymentRequest for users with API keys (supports both Lightning and on-chain) -->
  <StrikePaymentRequest 
    v-if="hasApiKey && connectionId"
    :handle="handle"
    :connection-id="connectionId"
  />
  
  <!-- Use StrikeInvoice for users without API keys (Lightning only) -->
  <StrikeInvoice 
    v-else
    :handle="handle"
  />
</template>
