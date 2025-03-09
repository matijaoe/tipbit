<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
})
</script>

<template>
  <div>
    <div class="mb-6">
      <Button variant="ghost" class="mb-4" @click="navigateTo('/dashboard/connections')">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to Connections
      </Button>

      <div class="mb-2 flex items-center gap-4">
        <h1 class="text-2xl font-bold">Strike</h1>
      </div>
      <p class="text-gray-500">Connect your Strike account to start accepting payments through Lightning Network.</p>
    </div>

    <div class="max-w-xl">
      <StrikeAccountSelector />
    </div>
  </div>
</template>
