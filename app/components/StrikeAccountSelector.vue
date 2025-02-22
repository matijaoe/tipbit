<script lang="ts" setup>
import { useToast } from '~/components/ui/toast'
import { fetchProfileByHandle } from '~~/lib/strike/api/api'
import type { StrikeAccountProfile } from '~~/lib/strike/api/types'
import { ChevronRight, X as XIcon } from 'lucide-vue-next'

const emit = defineEmits<{
  'clear-account': []
}>()

const accountHandle = useCookie<string>('tipbit_strike_account_handle')
const { data: account } = useAsyncData<StrikeAccountProfile | undefined>('strike:account', async () => {
  if (!accountHandle.value) return undefined
  return fetchProfileByHandle(accountHandle.value)
})

const { toast } = useToast()

const isDetailsOpen = ref(false)

const fetchAccount = async () => {
  if (!accountHandle.value) {
    toast({
      title: 'Please enter a Strike account handle',
      variant: 'default',
    })
    return
  }
  try {
    const fetchedAccount = await fetchProfileByHandle(accountHandle.value)
    if (!fetchedAccount) {
      toast({
        title: 'Failed to fetch account',
        variant: 'destructive',
      })
      return
    }
    account.value = fetchedAccount
    toast({
      title: 'Account connected',
      variant: 'default',
    })
  } catch (err) {
    console.error(err)
    toast({
      title: 'Account not found',
      variant: 'destructive',
    })
  }
}

const clearAccount = () => {
  accountHandle.value = ''
  account.value = undefined
  emit('clear-account')
}

const strikeAccountAddress = computed(() => {
  return `${account.value?.handle}@strike.me`
})
const strikeAccountTipUrl = computed(() => {
  return `https://strike.me/${account.value?.handle}`
})

defineExpose({ account })
</script>

<template>
  <section>
    <Card v-if="!account" class="w-full">
      <CardHeader>
        <CardTitle>Connect Strike Account</CardTitle>
        <CardDescription>Enter your Strike handle to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex gap-2" @submit.prevent="fetchAccount">
          <Input v-model="accountHandle" placeholder="Strike handle" class="w-sm" />
          <Button variant="default">Fetch Account</Button>
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
          <Button variant="ghost" size="icon" @click.stop="clearAccount">
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
