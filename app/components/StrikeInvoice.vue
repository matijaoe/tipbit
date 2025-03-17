<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type { Invoice, InvoiceRequestWithReceiver } from '~~/shared/payments/types'
import { getInvoices } from '~~/shared/providers/strike/api'
import type { StrikeAccountProfile, StrikeInvoice } from '~~/shared/providers/strike/types'
import { useToast } from './ui/toast'

const props = defineProps<{
  handle?: StrikeAccountProfile['handle']
}>()

const satsAmount = ref<number>()
const formattedSatsAmount = computed(() => formatAmount(satsAmount.value ?? 0))

const invoiceId = ref<Invoice['invoiceId']>()
const lnInvoice = ref<Invoice['lnInvoice']>('')
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

watchEffect(() => {
  if (!props.handle) {
    clearInvoice()
  }
})

const [_isInvoicePending, setIsInvoicePending] = useToggle(false)

const { toast } = useToast()

const tip = async () => {
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

  if (!props.handle) {
    toast({
      title: 'Profile invoice handle not found',
      variant: 'default',
    })
    setIsInvoicePending(false)
    return
  }

  try {
    const invoice = await $fetch<Invoice>('/api/invoices', {
      method: 'POST',
      body: {
        service: 'strike',
        amount: {
          amount: String(satsToBtc(sats)),
          currency: 'BTC',
        },
        description: 'tipbit demo invoice',
        receiver: props.handle,
      } satisfies InvoiceRequestWithReceiver,
    })

    console.log(invoice)

    invoiceId.value = invoice.invoiceId
    lnInvoice.value = invoice.lnInvoice
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice'
    console.error('Failed to create invoice:', error)
    toast({
      title: errorMessage,
      variant: 'destructive',
    })
  } finally {
    setIsInvoicePending(false)
  }
}

const cancelPendingInvoice = async () => {
  if (!invoiceId?.value) {
    toast({
      title: 'No invoice to cancel',
      variant: 'default',
    })
    return
  }

  try {
    const canceledInvoice = await $fetch<StrikeInvoice>(`/api/invoices/${invoiceId.value}/cancel`, {
      method: 'POST',
    })

    if (canceledInvoice?.state === 'CANCELLED') {
      clearInvoice()
      toast({
        title: 'Invoice canceled',
      })
    }
  } catch (error) {
    console.error('Failed to cancel invoice:', error)
    toast({
      title: 'Failed to cancel invoice',
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
</script>

<template>
  <div v-if="handle" class="space-y-4">
    <Card v-if="!lnInvoice">
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
        <CardDescription>Generate a Lightning Network invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex gap-2" @submit.prevent="tip">
          <Input
            v-model.number="satsAmount"
            full-width
            :disabled="!!lnInvoice"
            type="number"
            placeholder="Tip amount (sats)"
          />
          <Button :disabled="!satsAmount" type="submit">Tip</Button>
        </form>
      </CardContent>
    </Card>

    <div v-else class="rounded-t-lg bg-card pt-4">
      <div class="flex max-w-xs flex-col gap-4">
        <p class="text-xl">
          Tip <strong>{{ formattedSatsAmount }} sats</strong>
        </p>

        <img
          v-if="lnInvoiceQr"
          id="invoice-qr"
          :src="lnInvoiceQr"
          alt="Invoice QR Code"
          class="overflow-hidden rounded-xl"
        />

        <div class="mt-auto flex flex-wrap justify-end gap-3">
          <Button size="sm" variant="destructive" @click="cancelPendingInvoice">Cancel</Button>
          <Button size="sm" variant="secondary" @click="downloadQrCode">Download QR</Button>
          <Button size="sm" @click="() => copyInvoice(lnInvoice)">
            {{ copied ? 'Copied!!! 😎' : 'Copy to clipboard' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
