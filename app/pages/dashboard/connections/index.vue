<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { availableServices } from '~~/shared/data/services'
import type { ProviderService } from '~~/shared/types/connections'

definePageMeta({
  layout: 'dashboard',
})

const { isServiceConnected, isLoading } = useConnections()

const connectedServices = computed<ProviderService[]>(() =>
  availableServices.filter((service) => isServiceConnected(service.id))
)

const notConnectedServices = computed<ProviderService[]>(() =>
  availableServices.filter((service) => !isServiceConnected(service.id))
)
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
          class="cursor-pointer"
          @click="navigateTo(`/dashboard/connections/${service.id}`)"
        >
          <CardHeader>
            <div class="flex items-start gap-4">
              <Avatar size="sm">
                <AvatarImage v-if="service.logo" :src="service.logo" :alt="service.name" />
                <AvatarFallback>{{ service.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <div>
                <div class="flex items-center gap-2">
                  <CardTitle>{{ service.name }}</CardTitle>
                  <Badge size="sm" variant="outline" class="border-green-600 bg-green-500/20 text-green-100"
                    >connected</Badge
                  >
                </div>
                <CardDescription class="mt-1">{{ service.description }}</CardDescription>
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
            <div class="flex items-start gap-4">
              <Avatar size="sm">
                <AvatarImage v-if="service.logo" :src="service.logo" :alt="service.name" />
                <AvatarFallback>{{ service.name.charAt(0) }}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{{ service.name }}</CardTitle>
                <CardDescription class="mt-1">{{ service.description }}</CardDescription>
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
