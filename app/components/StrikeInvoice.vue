<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type { Invoice, InvoiceRequestWithReceiver } from '~~/shared/payments/types'
import type { StrikeAccountProfile, StrikeInvoice } from '~~/shared/providers/strike/types'
import { getInvoices } from '~~/shared/providers/strike/api'
import { useToast } from './ui/toast'
import { satsToBtc, formatAmount } from '~/utils/format'

const props = defineProps<{
  handle?: StrikeAccountProfile['handle']
}>()

const satsAmount = ref<number>()
const formattedSatsAmount = computed(() => formatAmount(satsAmount.value ?? 0))

const invoiceId = ref<Invoice['invoiceId']>()
const receiveRequestId = ref<string>()
const lnInvoice = ref<Invoice['lnInvoice']>('')
const onchainAddress = ref<string>('')
const lnInvoiceQr = useQRCode(lnInvoice)
const onchainAddressQr = useQRCode(onchainAddress)
const { copy: copyInvoice, copied: invoiceCopied } = useClipboard({ source: lnInvoice })
const activeTab = ref('lightning')

const clearInvoice = () => {
  invoiceId.value = undefined
  receiveRequestId.value = undefined
  lnInvoice.value = ''
  onchainAddress.value = ''
  satsAmount.value = undefined
}

watchEffect(() => {
  if (!props.handle) {
    clearInvoice()
  }
})

const [_isInvoicePending, setIsInvoicePending] = useToggle(false)

const { toast } = useToast()

const handleCreatePayment = async () => {
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
      title: 'Profile handle not found',
      variant: 'default',
    })
    setIsInvoicePending(false)
    return
  }

  try {
    // Generate invoice (for users without API keys)
    const invoice = await $fetch<Invoice>('/api/invoices', {
      method: 'POST',
      body: {
        service: 'strike',
        amount: {
          amount: String(satsToBtc(sats)),
          currency: 'BTC',
        },
        description: `Tip to ${props.handle}`,
        receiver: props.handle,
      } satisfies InvoiceRequestWithReceiver,
    })

    invoiceId.value = invoice.invoiceId
    lnInvoice.value = invoice.lnInvoice
    // No onchain for regular invoices
    onchainAddress.value = ''
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment'
    console.error('Failed to create payment:', error)
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

const hasPaymentData = computed(() => !!(lnInvoice.value || onchainAddress.value))

const downloadQrCode = () => {
  const qrSource = activeTab.value === 'lightning' ? lnInvoiceQr.value : onchainAddressQr.value
  const filename = activeTab.value === 'lightning' ? 'invoice.png' : 'bitcoin-address.png'

  const link = document.createElement('a')
  link.href = qrSource
  link.download = filename
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
    <!-- Amount input form -->
    <Card v-if="!hasPaymentData">
      <CardHeader>
        <CardTitle>Send Payment to {{ handle }}</CardTitle>
        <CardDescription>Enter amount to generate Lightning payment</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex gap-2" @submit.prevent="handleCreatePayment">
          <Input
            v-model.number="satsAmount"
            full-width
            type="number"
            placeholder="Tip amount (sats)"
            min="1"
            :disabled="_isInvoicePending"
          />
          <Button :disabled="!satsAmount || _isInvoicePending" type="submit"> Tip </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Payment display -->
    <div v-if="hasPaymentData" class="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Send {{ formattedSatsAmount }} to {{ handle }}</CardTitle>
          <CardDescription>Lightning Network payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-if="lnInvoiceQr" class="max-w-xs overflow-hidden rounded-xl">
              <img :src="lnInvoiceQr" alt="Lightning Invoice QR Code" />
            </div>
            <div class="flex flex-wrap gap-3">
              <Button size="sm" variant="secondary" @click="downloadQrCode">Download QR</Button>
              <Button size="sm" @click="() => copyInvoice(lnInvoice)">
                {{ invoiceCopied ? 'Copied! 😎' : 'Copy Invoice' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action buttons -->
      <div class="flex justify-center gap-3">
        <Button variant="outline" @click="clearInvoice">Create New Payment</Button>
        <Button v-if="invoiceId" size="sm" variant="destructive" @click="cancelPendingInvoice"> Cancel Invoice </Button>
      </div>
    </div>
  </div>
</template>
