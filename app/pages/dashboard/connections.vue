<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
})

const services = [
  {
    name: 'Strike',
    description: 'Connect your Strike account to start accepting payments.',
    logo: 'https://imgs.search.brave.com/RsTM1pqyQdo84cIFpCRwZVg9I8BxO_wjF4_-3PbDvrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF5/LWxoLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9fUEpXS0pnTkpT/Q1N6UDdnS3dCT1ZN/Ri1UNTZhREhrNS15/a3NJU1lrQlZrRFZV/bmFJNHhYcWhhMHFF/QXA5YzNzV1lFPXcy/NDAtaDQ4MC1ydw',
    url: 'https://strike.me',
  },
]
</script>

<template>
  <div>
    <h1>Connections</h1>
    <div class="mt-4 max-w-xl">
      <Card v-for="service in services" :key="service.name">
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
        <CardContent>
          <StrikeAccountSelector />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
