<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { nanoid } from 'nanoid'
import { useToast } from '~/components/ui/toast'
import { cancelInvoice, createInvoice, createQuote, fetchProfileByHandle, getInvoices } from '~~/lib/strike/api'
import type { StrikeAccountProfile, StrikeInvoice } from '~~/lib/strike/types'

// TODO: if user using own API_KEY, check if given handle matches for the API_KEY account, otherwise payment will fail
const accountHandle = useCookie<string>('tipbit_strike_account_handle')
const { data: account } = useAsyncData<StrikeAccountProfile | undefined>('strike:account', async () => {
  if (!accountHandle.value) {
    return undefined
  }
  return fetchProfileByHandle(accountHandle.value)
})

const satsAmount = ref<number>()

const formattedSatsAmount = computed(() => formatAmount(satsAmount.value ?? 0))

const invoiceId = ref<StrikeInvoice['invoiceId']>()
const lnInvoice = ref<string>('')
const lnInvoiceQr = useQRCode(lnInvoice)
const { copy: copyInvoice, copied } = useClipboard({ source: lnInvoice })

const clearAmount = () => {
  satsAmount.value = undefined
}
const clearInvoice = () => {
  invoiceId.value = undefined
  lnInvoice.value = ''
  clearAmount()
}

const [isInvoicePending, setIsInvoicePending] = useToggle(false)

const { toast } = useToast()

const tip = async () => {
  console.log('tip')
  setIsInvoicePending(true)

  const sats = satsAmount.value

  if (!sats) {
    toast({
      title: 'Please enter an amount',
      variant: 'default',
    })
    setIsInvoicePending(false)
    return
  }

  const invoice = await createInvoice({
    correlationId: nanoid(),
    description: 'tipbit invoice demo',
    amount: {
      amount: satsToBtc(sats),
      currency: 'BTC',
    },
  })
  console.log('invoice', invoice)
  if (!invoice?.invoiceId) {
    toast({
      title: 'Failed to create invoice',
      variant: 'destructive',
    })
    setIsInvoicePending(false)
    return
  }
  invoiceId.value = invoice.invoiceId

  const quote = await createQuote(invoiceId.value)

  console.log('quote', quote)
  if (!quote?.lnInvoice) {
    toast({
      title: 'Failed to create quote',
      variant: 'destructive',
    })
    setIsInvoicePending(false)
    return
  }
  lnInvoice.value = quote?.lnInvoice
  setIsInvoicePending(false)
}

const cancelPendingInvoice = async () => {
  if (!invoiceId?.value) {
    toast({
      title: 'No invoice to cancel',
      variant: 'default',
    })
    return
  }
  const canceledInvoice = await cancelInvoice(invoiceId.value)
  console.log('canceled invoice', canceledInvoice)
  if (canceledInvoice?.state === 'CANCELLED') {
    clearInvoice()
    toast({
      title: 'Invoice canceled',
      variant: 'destructive',
    })
  }
}

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

const downloadQrCode = () => {
  const link = document.createElement('a')
  link.href = lnInvoiceQr.value
  link.download = 'invoice.png'
  link.click()
}

const invoices = ref<StrikeInvoice[]>([])

const _getAccountInvoices = async () => {
  const fetchedInvoices = await getInvoices()
  console.log('fetchedInvoices', fetchedInvoices)
  invoices.value = fetchedInvoices
}

const clearAccount = () => {
  accountHandle.value = ''
  account.value = undefined
  invoices.value = []
  clearInvoice()
}
</script>

<template>
  <div class="max-w-lg px-5 font-mono">
    <section>
      <form v-if="!account" class="flex gap-2" @submit.prevent="fetchAccount">
        <Input v-model="accountHandle" placeholder="Strike handle" class="w-sm" />
        <Button variant="default">Fetch Account</Button>
      </form>

      <div v-if="account" class="flex items-center gap-5">
        <div class="flex flex-col items-end gap-3">
          <details>
            <summary class="cursor-pointer">
              <div class="inline-flex items-center gap-3">
                <p>{{ account.handle }}@strike.me</p>
                <img :src="account.avatarUrl" alt="Avatar" class="size-8 rounded-full" />
              </div>
            </summary>
            <div class="space-y-2 overflow-auto px-3 py-1">
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
                <NuxtLink
                  external
                  :href="`https://strike.me/${account.handle}`"
                  class="text-blue-400 hover:underline"
                  target="_blank"
                >
                  strike.me/{{ account.handle }}
                </NuxtLink>
              </div>

              <Button variant="destructive" @click="clearAccount"> Clear Account </Button>
            </div>
          </details>
        </div>
      </div>
    </section>

    <div v-if="account">
      <section class="mt-8 flex flex-col gap-5">
        <form class="flex gap-2" @submit.prevent="tip">
          <Input v-model.number="satsAmount" :disabled="!!lnInvoice" type="number" placeholder="Tip amount (sats)" />
          <Button :disabled="!satsAmount" type="submit"> Tip </Button>
        </form>

        <div v-if="isInvoicePending || lnInvoice">
          <div v-if="isInvoicePending" class="animate-pulse">
            <p>Creating invoice...</p>
          </div>

          <div v-else class="space-y-3">
            <h2 class="text-xl">⚡ Lightning Invoice:</h2>

            <p class="text-xl">
              Tip <strong>{{ formattedSatsAmount }} sats</strong>
            </p>
            <div class="mt-4 max-w-xs">
              <div class="flex flex-col gap-3">
                <img
                  v-if="lnInvoiceQr"
                  id="invoice-qr"
                  :src="lnInvoiceQr"
                  alt="Invoice QR Code"
                  class="overflow-hidden rounded-xl"
                />

                <div class="mt-auto flex flex-wrap justify-end gap-3">
                  <Button variant="destructive" @click="cancelPendingInvoice">Cancel</Button>
                  <Button variant="secondary" @click="downloadQrCode"> Download QR </Button>
                  <Button @click="copyInvoice()">
                    {{ copied ? 'Copied!!! 😎' : 'Copy to clipboard' }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
