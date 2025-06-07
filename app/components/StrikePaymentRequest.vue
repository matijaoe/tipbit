<script lang="ts" setup>
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useToast } from '~/components/ui/toast'
import type { StrikeCreateReceiveRequest, StrikeDecimalAmount } from '~~/shared/providers/strike/types'
import { AnimatePresence, Motion } from 'motion-v'
import { formatAmount, satsToBtc } from '~/utils/format'

const props = defineProps<{
  handle: string
  connectionId: string
}>()

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
const activeTab = ref('lightning')

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
  if (!props.connectionId) {
    toast({ title: 'No Strike connection found', variant: 'destructive' })
    return
  }

  setIsRequestPending(true)
  const sats = satsAmount.value
  if (!sats) {
    toast({ title: 'Please enter an amount', variant: 'default' })
    setIsRequestPending(false)
    return
  }
  const amount: StrikeDecimalAmount = { amount: satsToBtc(sats).toString(), currency: 'BTC' }
  const body: StrikeCreateReceiveRequest & { connectionId: string } = {
    connectionId: props.connectionId,
    bolt11: { amount },
    onchain: { amount },
  }

  try {
    const receiveRequest = await $fetch('/api/receive-requests', {
      method: 'POST',
      body,
    })
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
  if (!props.connectionId) {
    toast({ title: 'No Strike connection found', variant: 'destructive' })
    return
  }

  satsAmount.value = 0
  setIsRequestPending(true)
  const body: StrikeCreateReceiveRequest & { connectionId: string } = {
    connectionId: props.connectionId,
    bolt11: {},
    onchain: {},
  }

  try {
    const receiveRequest = await $fetch('/api/receive-requests', {
      method: 'POST',
      body,
    })
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

// Download the QR code for Lightning invoices
const downloadQrCode = () => {
  const qrSource = activeTab.value === 'lightning' ? lnInvoiceQr.value : onchainAddressQr.value
  const filename = activeTab.value === 'lightning' ? 'invoice.png' : 'bitcoin-address.png'

  const link = document.createElement('a')
  link.href = qrSource
  link.download = filename
  link.click()
}
</script>

<template>
  <div class="space-y-4">
    <Card v-if="!lnInvoice && !onchainAddress">
      <CardHeader>
        <CardTitle>Send Payment to {{ handle }}</CardTitle>
        <CardDescription>Generate a Lightning or On-chain payment request</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex gap-2">
          <Input
            v-model.number="satsAmount"
            :disabled="isRequestPending || !!lnInvoice || !!onchainAddress"
            type="number"
            full-width
            placeholder="Tip amount (sats)"
          />
          <Button :disabled="isRequestPending || !satsAmount" @click="createRequest">Request</Button>
        </div>

        <Button variant="link" size="sm" class="-ml-3 mt-3" @click="createAmountlessRequest">
          I don't want to set an amount
        </Button>
      </CardContent>
    </Card>

    <div v-if="lnInvoice || onchainAddress" class="rounded-lg bg-card pt-4">
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="mb-4 grid w-fit grid-cols-2">
          <TabsTrigger value="lightning"> ⚡ Lightning </TabsTrigger>
          <TabsTrigger value="onchain"> 🔗 On-chain </TabsTrigger>
        </TabsList>

        <div class="relative min-h-[300px] px-0 pt-4">
          <AnimatePresence mode="wait">
            <Motion
              v-if="activeTab === 'lightning'"
              key="lightning-tab"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :exit="{ x: -20, opacity: 0 }"
              :transition="{ duration: 0.2 }"
              class="flex w-full max-w-xs flex-col gap-4"
            >
              <p v-if="satsAmount" class="text-xl">
                Tip <strong>{{ formattedSatsAmount }} sats</strong> to {{ handle }}
              </p>

              <div v-if="lnInvoiceQr" id="invoice-qr" class="overflow-hidden rounded-xl">
                <img :src="lnInvoiceQr" alt="Invoice QR Code" />
              </div>

              <div class="mt-auto flex flex-wrap justify-end gap-3">
                <Button size="sm" variant="secondary" @click="downloadQrCode">Download QR</Button>
                <Button size="sm" @click="() => copyInvoice(lnInvoice)">
                  {{ invoiceCopied ? 'Copied!!! 😎' : 'Copy to clipboard' }}
                </Button>
                <Button size="sm" variant="destructive" @click="clearReceiveRequest">Reset</Button>
              </div>
            </Motion>

            <Motion
              v-if="activeTab === 'onchain'"
              key="onchain-tab"
              :initial="{ x: 20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :exit="{ x: 20, opacity: 0 }"
              :transition="{ duration: 0.2 }"
              class="flex w-full max-w-xs flex-col items-start gap-4"
            >
              <p v-if="satsAmount" class="text-xl">
                Tip <strong>{{ formattedSatsAmount }} sats</strong> to {{ handle }}
              </p>

              <div v-if="onchainAddressQr" id="onchain-qr" class="overflow-hidden rounded-xl">
                <img :src="onchainAddressQr" alt="Bitcoin Address QR Code" />
              </div>

              <p class="break-all">{{ onchainAddress }}</p>

              <div class="mt-auto flex flex-wrap justify-end gap-3">
                <Button size="sm" variant="secondary" @click="downloadQrCode">Download QR</Button>
                <Button size="sm" @click="() => copyAddress(onchainAddress)">
                  {{ addressCopied ? 'Copied!!! 😎' : 'Copy to clipboard' }}
                </Button>
                <Button size="sm" variant="destructive" @click="clearReceiveRequest">Reset</Button>
              </div>
            </Motion>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  </div>
</template>