<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { nanoid } from 'nanoid'
import { getInvoices, cancelInvoice, createInvoice, createQuote, fetchProfileByHandle } from '~~/lib/strike/api'
import type { StrikeAccountProfile, StrikeInvoice } from '~~/lib/strike/types'

// TODO: if user using own API_KEY, check if given handle matches for the API_KEY account, otherwise payment will fail
const accountHandle = useCookie<string>('tipbit_strike_account_handle')
const { data: account } = useAsyncData<StrikeAccountProfile | undefined>('strike:account', async () => {
  if (!accountHandle.value) {
    return undefined
  }
  return fetchProfileByHandle(accountHandle.value)
})

watchEffect(() => {
  console.log('account', account.value)
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

const tip = async () => {
  setIsInvoicePending(true)

  const sats = satsAmount.value

  if (!sats) {
    alert('Please enter an amount')
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
    alert('Failed to create invoice')
    setIsInvoicePending(false)
    return
  }
  invoiceId.value = invoice.invoiceId

  const quote = await createQuote(invoiceId.value)
  console.log('quote', quote)
  if (!quote?.lnInvoice) {
    alert('Failed to create quote')
    setIsInvoicePending(false)
    return
  }
  lnInvoice.value = quote?.lnInvoice
  setIsInvoicePending(false)
}

const cancelPendingInvoice = async () => {
  if (!invoiceId?.value) {
    alert('No invoice to cancel')
    return
  }
  const canceledInvoice = await cancelInvoice(invoiceId.value)
  console.log('canceled invoice', canceledInvoice)
  if (canceledInvoice?.state === 'CANCELLED') {
    clearInvoice()
    alert('Invoice canceled')
  }
}

const fetchAccount = async () => {
  if (!accountHandle.value) {
    alert('Please enter a Strike account handle')
    return
  }
  const fetchedAccount = await fetchProfileByHandle(accountHandle.value)
  if (!fetchedAccount) {
    alert('Failed to fetch account')
    return
  }
  account.value = fetchedAccount
}

const downloadQrCode = () => {
  const link = document.createElement('a')
  link.href = lnInvoiceQr.value
  link.download = 'invoice.png'
  link.click()
}

const invoices = ref<StrikeInvoice[]>([])

const clearAccount = () => {
  accountHandle.value = ''
  account.value = undefined
  invoices.value = []
}

const getAccountInvoices = async () => {
  const fetchedInvoices = await getInvoices()
  console.log('fetchedInvoices', fetchedInvoices)
  invoices.value = fetchedInvoices
}
</script>

<template>
  <div class="font-mono">
    <section>
      <form v-if="!account" class="flex gap-2" @submit.prevent="fetchAccount">
        <input v-model="accountHandle" placeholder="Strike handle" class="rounded-sm bg-zinc-200/20 px-2 py-0.5" />
        <button class="rounded-sm bg-white px-2 py-0.5 text-zinc-950" type="submit">Fetch Account</button>
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

              <button class="rounded-sm bg-zinc-800/90 px-2 py-0.5 text-zinc-100" @click="clearAccount">
                Clear Account
              </button>
            </div>
          </details>
        </div>
      </div>
    </section>

    <div v-if="account">
      <section class="mt-8 flex flex-col gap-5">
        <div class="flex gap-2">
          <input
            v-model.number="satsAmount"
            :disabled="!!lnInvoice"
            class="rounded-sm bg-zinc-200/20 px-2 py-0.5"
            type="number"
            placeholder="Tip amount (sats)"
          />
          <button class="rounded-sm bg-white px-2 py-0.5 text-zinc-950" :disabled="!satsAmount" @click="tip">
            Tip
          </button>
        </div>

        <div v-if="lnInvoice || isInvoicePending" class="max-w-2xl space-y-3">
          <h2 class="text-xl">⚡ Lightning Invoice:</h2>

          <div v-if="isInvoicePending" class="animate-pulse">
            <p>Creating invoice...</p>
          </div>

          <div v-else>
            <p class="text-xl">
              <strong>{{ formattedSatsAmount }} sats</strong>
            </p>
            <div class="mt-4 grid grid-cols-2 gap-6">
              <div class="flex flex-col gap-4">
                <p readonly class="font-mono break-words">{{ lnInvoice }}</p>

                <div class="mt-auto flex justify-end gap-3">
                  <button class="rounded-sm bg-red-800/90 px-2 py-0.5 text-zinc-100" @click="cancelPendingInvoice">
                    Cancel
                  </button>
                  <button class="rounded-sm bg-white/90 px-2 py-0.5 text-zinc-950" @click="copyInvoice()">
                    {{ copied ? 'Copied!!! 😎' : 'Copy to clibpoard' }}
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-3">
                <img
                  v-if="lnInvoiceQr"
                  id="invoice-qr"
                  :src="lnInvoiceQr"
                  alt="QR Code"
                  class="overflow-hidden rounded-sm"
                />
                <div>
                  <button class="rounded-sm bg-white/90 px-2 py-0.5 text-zinc-950" @click="downloadQrCode">
                    Download QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
