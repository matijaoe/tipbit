<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next'
import { useConnections } from '~/composables/connections/index'
import { Badge } from '@/components/ui/badge'

definePageMeta({
  layout: 'dashboard',
})
type ProviderService = {
  id: ProviderType
  name: string
  description: string
  logo?: string
  url: string
}

const services = [
  {
    id: 'strike',
    name: 'Strike',
    description: 'Connect your Strike account to start accepting payments.',
    logo: 'https://imgs.search.brave.com/RsTM1pqyQdo84cIFpCRwZVg9I8BxO_wjF4_-3PbDvrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF5/LWxoLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9fUEpXS0pnTkpT/Q1N6UDdnS3dCT1ZN/Ri1UNTZhREhrNS15/a3NJU1lrQlZrRFZV/bmFJNHhYcWhhMHFF/QXA5YzNzV1lFPXcy/NDAtaDQ4MC1ydw',
    url: 'https://strike.me',
  },
  {
    id: 'coinos',
    name: 'Coinos',
    description: 'Accept Lightning payments via Coinos.',
    logo: '',
    url: 'https://coinos.io',
  },
  {
    id: 'alby',
    name: 'Alby',
    description: 'Connect your Alby wallet to receive tips.',
    logo: '',
    url: 'https://getalby.com',
  },
] satisfies ProviderService[]

const { isServiceConnected, isLoading } = useConnections()

const connectedServices = computed(() => services.filter((service) => isServiceConnected(service.id)))

const notConnectedServices = computed(() => services.filter((service) => !isServiceConnected(service.id)))
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">Connections</h1>
    <p class="mb-6 text-gray-500">Connect your payment services to receive tips through Lightning Network.</p>

    <!-- Connected services section -->
    <div v-if="connectedServices.length > 0" class="mb-8">
      <h2 class="mb-4 text-xl font-semibold">Connected Services</h2>
      <div class="grid max-w-xl gap-4">
        <Card
          v-for="service in connectedServices"
          :key="service.id"
          class="cursor-pointer border-green-200 transition-all hover:shadow-md"
          @click="navigateTo(`/dashboard/connections/${service.id}`)"
        >
          <CardHeader>
            <div class="flex items-center gap-4">
              <Avatar size="base">
                <AvatarImage :src="service.logo" :alt="service.name" />
              </Avatar>
              <div>
                <div class="flex items-center">
                  <CardTitle>{{ service.name }}</CardTitle>
                  <Badge variant="outline" class="ml-2 bg-green-50 text-green-700">Connected</Badge>
                </div>
                <CardDescription>{{ service.description }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter class="justify-end">
            <Button variant="ghost" size="sm" @click="navigateTo(`/dashboard/connections/${service.id}`)">
              Configure
              <ChevronRight class="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Not connected services section -->
    <div v-if="notConnectedServices.length > 0">
      <h2 class="mb-4 text-xl font-semibold">Available Services</h2>
      <div class="grid max-w-xl gap-4">
        <Card
          v-for="service in notConnectedServices"
          :key="service.id"
          class="cursor-pointer transition-all hover:shadow-md"
          @click="navigateTo(`/dashboard/connections/${service.id}`)"
        >
          <CardHeader>
            <div class="flex items-center gap-4">
              <Avatar size="base">
                <AvatarImage :src="service.logo" :alt="service.name" />
              </Avatar>
              <div>
                <CardTitle>{{ service.name }}</CardTitle>
                <CardDescription>{{ service.description }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter class="justify-end">
            <Button variant="ghost" size="sm" @click="navigateTo(`/dashboard/connections/${service.id}`)">
              Connect
              <ChevronRight class="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="my-4 text-gray-500">Loading connections...</div>
  </div>
</template>
