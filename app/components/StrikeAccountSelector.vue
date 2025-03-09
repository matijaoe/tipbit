<script setup lang="ts">
import { ChevronRight, X as XIcon } from 'lucide-vue-next'
import { useStrikeConnection } from '~/composables/connections/strike'

const localHandle = useCookie('strike_handle')

const {
  account,
  connection,
  connectAccount,
  disconnectAccount,
  isConnectionLoading,
  isAccountLoading,
  strikeAccountAddress,
  strikeAccountTipUrl,
} = useStrikeConnection()

// Handle clear from composable and emit event
const handleClearAccount = () => {
  disconnectAccount()
}

const isDetailsOpen = ref(false)
</script>

<template>
  <section>
    <div>
      <pre>{{ connection }}</pre>
    </div>
    <Card v-if="!account" class="w-full">
      <CardHeader>
        <CardTitle>Connect Strike Account</CardTitle>
        <CardDescription>Enter your Strike handle to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex gap-2" @submit.prevent="connectAccount(localHandle)">
          <Input v-model.trim="localHandle" placeholder="Strike handle" full-width />
          <Button variant="default" :loading="isConnectionLoading || isAccountLoading">Fetch Account</Button>
        </form>
      </CardContent>
    </Card>

    <Card v-else class="w-full">
      <CardHeader class="cursor-pointer" @click="isDetailsOpen = !isDetailsOpen">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ChevronRight class="size-4 transition-transform duration-200" :class="{ 'rotate-90': isDetailsOpen }" />
            <CardTitle>{{ strikeAccountAddress }}</CardTitle>
            <img :src="account.avatarUrl" alt="Avatar" class="size-8 rounded-full" />
          </div>
          <Button variant="ghost" size="icon" @click.stop="handleClearAccount">
            <XIcon />
          </Button>
        </div>
      </CardHeader>
      <CardContent v-show="isDetailsOpen" class="space-y-3 text-sm">
        <div v-if="account.description">
          <p class="font-bold">Description:</p>
          <p>{{ account.description }}</p>
        </div>
        <div>
          <p class="flex items-center gap-2">
            <span class="font-bold">Can receive:</span>
            <span class="font-bold">{{ account.canReceive ? '✅' : '❌' }}</span>
          </p>
        </div>
        <div>
          <p class="font-bold">Currencies:</p>
          <div class="flex items-center gap-2">
            <span v-for="(currency, index) in account.currencies" :key="currency.currency">
              {{ currency.currency }}
              <span v-if="index !== account.currencies.length - 1"> / </span>
            </span>
          </div>
        </div>
        <div>
          <NuxtLink external :href="strikeAccountTipUrl" class="text-blue-400 hover:underline" target="_blank">
            {{ strikeAccountTipUrl.replace('https://', '') }}
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
