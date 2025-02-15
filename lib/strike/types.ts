export type StrikeCurrency = 'BTC' | 'USD' | 'EUR' | 'USDT' | 'GBP'

export type StrikeInvoiceAmount = {
  amount: string | number
  currency: StrikeCurrency
}

export type StrikeCreateInvoiceRequest = {
  correlationId: string
  description: string
  amount: StrikeInvoiceAmount
}

export type StrikeInvoiceState = 'UNPAID' | 'PAID' | 'CANCELLED' | 'EXPIRED'

export type StrikeInvoice = {
  invoiceId: string
  correlationId: string
  description: string
  amount: StrikeInvoiceAmount
  state: StrikeInvoiceState
  created: string // ISO 8601 timestamp
  lnInvoice?: string // Lightning Network Invoice (BOLT11)
}

export type StrikeCreateQuoteRequest = {
  descriptionHash?: string
}

export type StrikeCurrencyAmount = {
  amount: string
  currency: StrikeCurrency
}

export type StrikeConversionRate = {
  amount: string
  sourceCurrency: StrikeCurrency
  targetCurrency: StrikeCurrency
}

export type StrikeQuote = {
  quoteId: string
  description?: string
  lnInvoice: string
  onchainAddress?: string
  expiration: string // ISO 8601 date-time
  expirationInSec: number
  targetAmount: StrikeCurrencyAmount
  sourceAmount: StrikeCurrencyAmount
  conversionRate: StrikeConversionRate
}

export type StrikeSupportedCurrency = {
  currency: StrikeCurrency
  isDefaultCurrency: boolean
  isAvailable: boolean
  isInvoiceable: boolean
}

export type StrikeAccountProfile = {
  id: string
  handle: string
  avatarUrl?: string
  description?: string
  canReceive: boolean
  currencies: StrikeSupportedCurrency[]
}

export type StrikeFeePolicy = 'INCLUSIVE' | 'EXCLUSIVE'

export type StrikeCreateOnchainQuoteRequest = {
  btcAddress: string
  sourceCurrency: StrikeCurrency
  description?: string
  amount: StrikeInvoiceAmount
  feePolicy?: StrikeFeePolicy
  onchainTierId: string
}

export type StrikeOnchainQuote = {
  paymentQuoteId: string
  description?: string
  validUntil?: string // ISO 8601 date-time
  estimatedDeliveryDurationInMin?: number
  conversionRate?: {
    amount: string
    sourceCurrency: StrikeCurrency
    targetCurrency: StrikeCurrency
  }
  amount: StrikeCurrencyAmount
  totalFee?: StrikeCurrencyAmount
  totalAmount: StrikeCurrencyAmount
  reward?: StrikeCurrencyAmount
}
