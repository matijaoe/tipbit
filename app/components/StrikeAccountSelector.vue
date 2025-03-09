<script setup lang="ts">
import { ChevronRight, X as XIcon } from 'lucide-vue-next'
import { useStrikeConnection } from '~/composables/connections/strike'

const {
  // Current connection
  connection,
  isConnected,
  isConnectionLoading,
  connectAccount,
  disconnectAccount,

  // Strike profile
  profile,
  profileHandle,
} = useStrikeConnection()

const localHandle = ref(profileHandle.value ?? '')
const strikeProfileAddress = computed(() => {
  if (!isDefined(profileHandle)) {
    return ''
  }
  return `${profileHandle.value}@strike.me`
})
const strikeProfileTipUrl = computed(() => {
  if (!isDefined(profileHandle)) {
    return ''
  }
  const url = new URL('https://strike.me')
  url.pathname = profileHandle.value
  return url.href
})

const isDetailsOpen = ref(false)

const clearConnection = () => {
  localHandle.value = ''
  isDetailsOpen.value = false
  disconnectAccount()
}

defineExpose({
  connection,
  clearConnection,
})
</script>

<template>
  <section>
    <Card v-if="!isConnected && !profile" class="w-full">
      <CardHeader>
        <CardTitle>Connect Strike Account</CardTitle>
        <CardDescription>Enter your Strike handle to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex gap-2" @submit.prevent="connectAccount(localHandle)">
          <Input v-model.trim="localHandle" placeholder="Strike handle" full-width />
          <Button v-if="!isConnected" variant="default" :loading="isConnectionLoading">Fetch Account</Button>
        </form>
      </CardContent>
    </Card>

    <Card v-else-if="profile" class="w-full">
      <CardHeader class="cursor-pointer" @click="isDetailsOpen = !isDetailsOpen">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ChevronRight class="size-4 transition-transform duration-200" :class="{ 'rotate-90': isDetailsOpen }" />
            <CardTitle>{{ strikeProfileAddress }}</CardTitle>
            <img :src="profile.avatarUrl" alt="Avatar" class="size-8 rounded-full" />
          </div>
          <Button variant="ghost" size="icon" @click.stop="clearConnection">
            <XIcon />
          </Button>
        </div>
      </CardHeader>
      <CardContent v-show="isDetailsOpen" class="space-y-3 text-sm">
        <div v-if="profile.description">
          <p class="font-bold">Description:</p>
          <p>{{ profile.description }}</p>
        </div>
        <div>
          <p class="flex items-center gap-2">
            <span class="font-bold">Can receive:</span>
            <span class="font-bold">{{ profile.canReceive ? '✅' : '❌' }}</span>
          </p>
        </div>
        <div>
          <p class="font-bold">Currencies:</p>
          <div class="flex items-center gap-2">
            <span v-for="(currency, index) in profile.currencies" :key="currency.currency">
              {{ currency.currency }}
              <span v-if="index !== profile.currencies.length - 1"> / </span>
            </span>
          </div>
        </div>
        <div>
          <NuxtLink external :href="strikeProfileTipUrl" class="text-blue-400 hover:underline" target="_blank">
            {{ strikeProfileTipUrl.replace('https://', '') }}
          </NuxtLink>
        </div>
      </CardContent>
    </Card>

    <Card v-else-if="!isConnectionLoading" class="w-full">
      <CardHeader>
        <CardTitle>No Strike account profile found</CardTitle>
        <CardDescription>Please try connecting your Strike account again</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="default" @click="disconnectAccount">Connect Strike Account</Button>
      </CardContent>
    </Card>
  </section>
</template>
