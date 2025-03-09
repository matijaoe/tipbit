<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
})

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
]
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">Connections</h1>
    <p class="mb-6 text-gray-500">Connect your payment services to receive tips through Lightning Network.</p>

    <div class="mt-4 grid max-w-xl gap-4">
      <Card
        v-for="service in services"
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
            Configure
            <ChevronRight class="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
