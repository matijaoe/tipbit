<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';

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
        <Avatar size="lg">
          <AvatarImage
            src="https://imgs.search.brave.com/RsTM1pqyQdo84cIFpCRwZVg9I8BxO_wjF4_-3PbDvrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF5LWxoLmdvb2dsZXVzZXJjb250ZW50LmNvbS9fUEpXS0pnTkpTQ1N6UDdnS3dCT1ZNRi1UNTZhREhrNS15a3NJU1lrQlZrRFZVbmFJNHhYcWhhMHFFQXA5YzNzV1lFPXcyNDAtaDQ4MC1ydw"
            alt="Strike"
          />
        </Avatar>
        <h1 class="text-2xl font-bold">Strike Connection</h1>
      </div>
      <p class="text-gray-500">Connect your Strike account to start accepting payments through Lightning Network.</p>
    </div>

    <div class="max-w-xl">
      <StrikeAccountSelector />
    </div>
  </div>
</template>
