<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { nanoid } from 'nanoid'
import type { CreateInvoiceRequest, CreateQuoteResponse, StrikeInvoice } from '~~/types/strike'

const satsAmount = ref<number>()
const satsToBtc = (sats: number) => sats / 100_000_000

const invoiceId = ref<StrikeInvoice['invoiceId']>()
const lnInvoice = ref<string>('')
const lnInvoiceQr = useQRCode(lnInvoice)
const { copy: copyInvoice, copied, isSupported } = useClipboard({ source: lnInvoice })

const clearInvoice = () => {
  invoiceId.value = undefined
  lnInvoice.value = ''
}

const config = useRuntimeConfig()

const strikeApiFetch = $fetch.create({
  baseURL: 'https://api.strike.me/v1',
  headers: {
    Authorization: `Bearer ${config.public.strikeApiKey}`,
  },
})

const issueStrikeInvoice = async (body: CreateInvoiceRequest) => {
  try {
    const invoice = await strikeApiFetch<StrikeInvoice>('/invoices', {
      method: 'POST',
      body,
    })
    return invoice
  } catch (err) {
    console.error(err)
  }
}

const issueQuoteForInvoice = async (invoiceId: string) => {
  try {
    const invoice = await strikeApiFetch<CreateQuoteResponse>(`/invoices/${invoiceId}/quote`, {
      method: 'POST',
    })
    return invoice
  } catch (err) {
    console.error(err)
  }
}

const cancelPendingInvoice = async (invoiceId: string) => {
  try {
    return await strikeApiFetch<StrikeInvoice>(`/invoices/${invoiceId}/cancel`, {
      method: 'PATCH',
    })
  } catch (err) {
    console.error(err)
  }
}

const isInvoicePending = ref(false)

const tip = async () => {
  isInvoicePending.value = true

  if (!satsAmount.value) {
    alert('Please enter an amount')
    isInvoicePending.value = false
    return
  }
  const sats = satsAmount.value
  satsAmount.value = undefined

  const invoice = await issueStrikeInvoice({
    correlationId: nanoid(),
    description: 'tipbit invoice demo',
    amount: {
      amount: satsToBtc(sats),
      currency: 'BTC',
    },
  })
  console.log(invoice)
  if (!invoice?.invoiceId) {
    alert('Failed to create invoice')
    isInvoicePending.value = false
    return
  }
  invoiceId.value = invoice.invoiceId

  const quote = await issueQuoteForInvoice(invoiceId.value)
  console.log(quote)
  if (!quote?.lnInvoice) {
    alert('Failed to create quote')
    isInvoicePending.value = false
    return
  }
  lnInvoice.value = quote?.lnInvoice
  isInvoicePending.value = false
}

const cancelInvoice = async () => {
  if (!invoiceId?.value) {
    alert('No invoice to cancel')
    return
  }
  const res = await cancelPendingInvoice(invoiceId.value)
  console.log(res)
  if (res?.state === 'CANCELLED') {
    clearInvoice()
    alert('Invoice canceled')
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-5">
      <div class="flex gap-2">
        <input
          v-model.number="satsAmount"
          class="bg-zinc-200/20 px-2 py-0.5"
          type="number"
          placeholder="Tip amount (sats)"
        />
        <button class="bg-white px-2 py-0.5 text-zinc-950" :disabled="!satsAmount" @click="tip">Tip</button>
      </div>

      <div v-if="lnInvoice || isInvoicePending" class="max-w-2xl space-y-3">
        <p>⚡ Lightning Invoice:</p>

        <div v-if="isInvoicePending" class="animate-pulse">
          <p>Creating invoice...</p>
        </div>

        <div v-else>
          <div class="grid grid-cols-2 gap-6">
            <div class="flex flex-col gap-4">
              <p readonly class="font-mono break-words">{{ lnInvoice }}</p>

              <div class="mt-auto flex justify-end gap-3">
                <button class="bg-red-800 px-2 py-0.5 text-zinc-100" @click="cancelInvoice">Cancel</button>
                <button class="bg-white px-2 py-0.5 text-zinc-950" @click="copyInvoice()">
                  {{ copied ? 'Copied! 😎  ' : 'Copy invoice' }}
                </button>
              </div>
            </div>
            <img v-if="lnInvoiceQr" :src="lnInvoiceQr" alt="QR Code" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
