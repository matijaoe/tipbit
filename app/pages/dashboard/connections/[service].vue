<script setup lang="ts">
import { CheckCircle, ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  validate: (route) => {
    return ['strike', 'coinos', 'alby'].includes(route.params.service as string)
  },
})

const route = useRoute()
const service = route.params.service as string

// Service details mapping
const serviceMap = {
  strike: {
    name: 'Strike',
    logo: 'https://imgs.search.brave.com/RsTM1pqyQdo84cIFpCRwZVg9I8BxO_wjF4_-3PbDvrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF5LWxoLmdvb2dsZXVzZXJjb250ZW50LmNvbS9fUEpXS0pnTkpTQ1N6UDdnS3dCT1ZNRi1UNTZhREhrNS15a3NJU1lrQlZrRFZVbmFJNHhYcWhhMHFFQXA5YzNzV1lFPXcyNDAtaDQ4MC1ydw',
    description: 'Connect your Strike account to start accepting payments.',
    placeholderHandle: '@handle',
    helpText: 'Enter your Strike handle to link your account.',
  },
  coinos: {
    name: 'Coinos',
    description: 'Accept Lightning payments via Coinos.',
    logo: '',
    placeholderHandle: 'handle',
    helpText: 'Enter your Coinos username to link your account.',
  },
  alby: {
    name: 'Alby',
    logo: '',
    description: 'Connect your Alby wallet to receive tips.',
    placeholderHandle: 'handle@getalby.com',
    helpText: 'Enter your Alby Lightning address to link your account.',
  },
}

const currentService = computed(() => serviceMap[service as keyof typeof serviceMap])
const handle = ref('')
const isConnected = ref(false)
const isLoading = ref(false)

const connectService = async () => {
  if (!handle.value) return

  isLoading.value = true

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  isConnected.value = true
  isLoading.value = false
}
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
          <AvatarImage :src="currentService.logo" :alt="currentService.name" />
        </Avatar>
        <h1 class="text-2xl font-bold">{{ currentService.name }} Connection</h1>
      </div>
      <p class="text-gray-500">{{ currentService.description }}</p>
    </div>

    <Card class="max-w-xl">
      <CardHeader>
        <CardTitle>Connect your {{ currentService.name }} account</CardTitle>
        <CardDescription> Enter your {{ currentService.name }} handle to start receiving tips </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="connectService">
          <div class="space-y-2">
            <Label for="handle">{{ currentService.name }} Handle</Label>
            <Input
              id="handle"
              v-model="handle"
              :placeholder="currentService.placeholderHandle"
              :disabled="isConnected || isLoading"
            />
            <p class="text-sm text-gray-500">{{ currentService.helpText }}</p>
          </div>

          <div v-if="isConnected" class="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700">
            <CheckCircle class="h-5 w-5" />
            <span>Successfully connected to {{ currentService.name }}</span>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          class="w-full"
          :disabled="!handle || isConnected"
          :loading="isLoading"
          @click="connectService"
        >
          {{ isConnected ? 'Connected' : 'Connect' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
