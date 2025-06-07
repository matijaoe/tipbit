<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { satsToBtc } from '~/utils/format'
import type { Invoice, InvoiceRequestWithReceiver } from '~~/shared/payments/types'
import type { StrikeAccountProfile, StrikeInvoice } from '~~/shared/providers/strike/types'
import { useToast } from './ui/toast'

const props = defineProps<{
  strikeHandle?: StrikeAccountProfile['handle']
}>()

const satsAmount = ref<number>()

const invoiceId = ref<Invoice['invoiceId']>()
const receiveRequestId = ref<string>()
const lnInvoice = ref<Invoice['lnInvoice']>('')

const lnInvoiceQr = useQRCode(lnInvoice)

const { copy: copyInvoice, copied: invoiceCopied } = useClipboard({ source: lnInvoice })

const clearInvoice = () => {
  invoiceId.value = undefined
  receiveRequestId.value = undefined
  lnInvoice.value = ''
  satsAmount.value = undefined
}

watchEffect(() => {
  if (!props.strikeHandle) {
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

  if (!props.strikeHandle) {
    toast({
      title: 'Strike handle not found',
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
        description: `Tip to ${props.strikeHandle}`,
        receiver: props.strikeHandle,
      } satisfies InvoiceRequestWithReceiver,
    })

    invoiceId.value = invoice.invoiceId
    lnInvoice.value = invoice.lnInvoice
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

const downloadQr = () => {
  downloadQrCode(lnInvoiceQr.value, 'invoice.png')
}
</script>

<template>
  <div v-if="strikeHandle" class="space-y-4">
    <Card v-if="!lnInvoice">
      <CardContent class="pt-4">
        <form class="flex gap-2" @submit.prevent="handleCreatePayment">
          <Input v-model.number="satsAmount" full-width type="number" placeholder="Tip amount (sats)" min="1" />
          <Button :disabled="!satsAmount || _isInvoicePending" type="submit"> Tip </Button>
        </form>
      </CardContent>
    </Card>

    <div v-else-if="lnInvoice" class="space-y-4">
      <Card>
        <CardHeader>
          <CardDescription>Generate an invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-if="lnInvoiceQr" class="max-w-xs overflow-hidden rounded-xl">
              <img :src="lnInvoiceQr" alt="Lightning Invoice QR Code" />
            </div>
            <div class="flex flex-wrap gap-3">
              <Button size="sm" variant="secondary" @click="downloadQr">Download QR</Button>
              <Button size="sm" @click="() => copyInvoice(lnInvoice)">
                {{ invoiceCopied ? 'Copied! 😎' : 'Copy Invoice' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="flex justify-center gap-3">
        <Button variant="outline" @click="clearInvoice">Create New Payment</Button>
        <Button v-if="invoiceId" size="sm" variant="destructive" @click="cancelPendingInvoice"> Cancel Invoice </Button>
      </div>
    </div>
  </div>
</template>
