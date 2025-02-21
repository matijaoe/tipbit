<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useToast } from '~/components/ui/toast'
import { createReceiveRequest, fetchProfileByHandle } from '~~/lib/strike/api'
import type { StrikeAccountProfile, StrikeCreateReceiveRequest, StrikeDecimalAmount } from '~~/lib/strike/types'

// Track the Strike account handle via a cookie
const accountHandle = useCookie<string>('tipbit_strike_account_handle')
const { data: account } = useAsyncData<StrikeAccountProfile | undefined>('strike:account', async () => {
  if (!accountHandle.value) return undefined
  return fetchProfileByHandle(accountHandle.value)
})

// State for the amount
const satsAmount = ref<number>()
const formattedSatsAmount = computed(() => formatAmount(satsAmount.value ?? 0))

// State for the receive request
const receiveRequestId = ref<string>()
const lnInvoice = ref<string>('')
const onchainAddress = ref<string>('')
const lnInvoiceQr = useQRCode(lnInvoice)
const onchainAddressQr = useQRCode(onchainAddress)
const { copy: copyInvoice, copied: invoiceCopied } = useClipboard({ source: lnInvoice })
const { copy: copyAddress, copied: addressCopied } = useClipboard({ source: onchainAddress })
const activeTab = ref<'lightning' | 'onchain'>('lightning') // Tab selection

// Toggle for pending state
const [isRequestPending, setIsRequestPending] = useToggle(false)

// Toast for notifications
const { toast } = useToast()

// Clear function
const clearReceiveRequest = () => {
  receiveRequestId.value = undefined
  lnInvoice.value = ''
  onchainAddress.value = ''
  satsAmount.value = undefined
  toast({ title: 'Ready for a new tip', variant: 'default' })
}

// Create request with amount
const createRequest = async () => {
  setIsRequestPending(true)
  const sats = satsAmount.value
  if (!sats) {
    toast({ title: 'Please enter an amount', variant: 'default' })
    setIsRequestPending(false)
    return
  }
  const amount: StrikeDecimalAmount = { amount: satsToBtc(sats).toString(), currency: 'BTC' }
  const body: StrikeCreateReceiveRequest = {
    bolt11: { amount },
    onchain: { amount },
  }

  try {
    const receiveRequest = await createReceiveRequest(body)
    if (!receiveRequest?.receiveRequestId) throw new Error('Failed to create receive request')
    receiveRequestId.value = receiveRequest.receiveRequestId
    lnInvoice.value = receiveRequest.bolt11?.invoice || ''
    onchainAddress.value = receiveRequest.onchain?.address || ''
    if (!lnInvoice.value && !onchainAddress.value) throw new Error('No payment options returned')
    toast({ title: 'Tip request created', variant: 'default' })
  } catch (err) {
    console.error(err)
    toast({ title: 'Failed to create receive request', variant: 'destructive' })
  } finally {
    setIsRequestPending(false)
  }
}

// Create amountless request
const createAmountlessRequest = async () => {
  satsAmount.value = 0
  setIsRequestPending(true)
  const body: StrikeCreateReceiveRequest = {
    bolt11: {},
    onchain: {},
  }

  try {
    const receiveRequest = await createReceiveRequest(body)
    if (!receiveRequest?.receiveRequestId) throw new Error('Failed to create receive request')
    receiveRequestId.value = receiveRequest.receiveRequestId
    lnInvoice.value = receiveRequest.bolt11?.invoice || ''
    onchainAddress.value = receiveRequest.onchain?.address || ''
    if (!lnInvoice.value && !onchainAddress.value) throw new Error('No payment options returned')
    toast({ title: 'Amountless tip link created', variant: 'default' })
  } catch (err) {
    console.error(err)
    toast({ title: 'Failed to create receive request', variant: 'destructive' })
  } finally {
    setIsRequestPending(false)
  }
}

// Fetch the Strike account profile
const fetchAccount = async () => {
  if (!accountHandle.value) {
    toast({ title: 'Please enter a Strike account handle', variant: 'default' })
    return
  }
  try {
    const fetchedAccount = await fetchProfileByHandle(accountHandle.value)
    if (!fetchedAccount) throw new Error('Failed to fetch account')
    account.value = fetchedAccount
    toast({ title: 'Account connected', variant: 'default' })
  } catch (err) {
    console.error(err)
    toast({ title: 'Account not found', variant: 'destructive' })
  }
}

// Download the QR code for Lightning invoices
const downloadQrCode = () => {
  const qrSource = activeTab.value === 'lightning' ? lnInvoiceQr.value : onchainAddressQr.value
  const filename = activeTab.value === 'lightning' ? 'invoice.png' : 'bitcoin-address.png'

  const link = document.createElement('a')
  link.href = qrSource
  link.download = filename
  link.click()
}

// Clear the account and reset everything
const clearAccount = () => {
  accountHandle.value = ''
  account.value = undefined
  clearReceiveRequest()
}
</script>

<template>
  <div class="max-w-lg px-5 font-mono">
    <!-- Account Connection Section -->
    <section>
      <form v-if="!account" class="flex gap-2" @submit.prevent="fetchAccount">
        <Input v-model="accountHandle" placeholder="Strike handle" class="w-sm" />
        <Button variant="default" type="submit">Fetch Account</Button>
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
              <Button variant="destructive" @click="clearAccount">Clear Account</Button>
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- Receive Request Section -->
    <div v-if="account">
      <section class="mt-8 flex flex-col gap-5">
        <div class="flex gap-2">
          <Input
            v-model.number="satsAmount"
            :disabled="isRequestPending || !!lnInvoice || !!onchainAddress"
            type="number"
            placeholder="Tip amount (sats)"
          />
          <Button :disabled="isRequestPending || !satsAmount" @click="createRequest">Create Request</Button>
          <Button :disabled="isRequestPending" @click="createAmountlessRequest">Generate Amountless Tip</Button>
        </div>

        <div v-if="isRequestPending || lnInvoice || onchainAddress">
          <div v-if="isRequestPending" class="animate-pulse">
            <p>Creating receive request...</p>
          </div>

          <div v-else class="space-y-3">
            <div class="flex gap-2">
              <button
                :class="['p-2', activeTab === 'lightning' ? 'bg-gray-700' : 'bg-gray-900']"
                @click="activeTab = 'lightning'"
              >
                ⚡ Lightning
              </button>
              <button
                :class="['p-2', activeTab === 'onchain' ? 'bg-gray-700' : 'bg-gray-900']"
                @click="activeTab = 'onchain'"
              >
                🔗 On-chain
              </button>
            </div>
            <div v-if="activeTab === 'lightning'" class="mt-4 max-w-xs">
              <p v-if="satsAmount" class="text-xl">
                Tip <strong>{{ formattedSatsAmount }} sats</strong>
              </p>
              <img
                v-if="lnInvoiceQr"
                id="invoice-qr"
                :src="lnInvoiceQr"
                alt="Invoice QR Code"
                class="overflow-hidden rounded-xl"
              />
              <div class="mt-2 flex flex-wrap justify-end gap-3">
                <Button variant="secondary" @click="downloadQrCode">Download QR</Button>
                <Button @click="copyInvoice">{{ invoiceCopied ? 'Copied!!! 😎' : 'Copy to clipboard' }}</Button>
              </div>
            </div>
            <div v-else-if="activeTab === 'onchain'" class="mt-4 max-w-xs">
              <p v-if="satsAmount" class="text-xl">
                Tip <strong>{{ formattedSatsAmount }} sats</strong>
              </p>
              <img
                v-if="onchainAddressQr"
                id="onchain-qr"
                :src="onchainAddressQr"
                alt="Bitcoin Address QR Code"
                class="overflow-hidden rounded-xl"
              />
              <p class="font-bold">On-chain Address:</p>
              <p class="break-all">{{ onchainAddress }}</p>
              <div class="mt-2 flex flex-wrap justify-end gap-3">
                <Button variant="secondary" @click="downloadQrCode">Download QR</Button>
                <Button @click="copyAddress">{{ addressCopied ? 'Copied!!! 😎' : 'Copy to clipboard' }}</Button>
              </div>
            </div>
            <Button variant="destructive" @click="clearReceiveRequest">Reset</Button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
