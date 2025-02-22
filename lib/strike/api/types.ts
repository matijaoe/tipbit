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

export type StrikeDecimalAmount = {
  amount: string
  currency: StrikeCurrency
}

export type StrikeCreateReceiveRequest = {
  bolt11?: {
    amount?: StrikeDecimalAmount
    description?: string // 1 ≤ length ≤ 250
    descriptionHash?: string // Hex string, overrides description if provided
    expiryInSeconds?: number // int64, Lightning invoice expiry
  } // Empty object for default Lightning config; omit for no Lightning invoice
  onchain?: {
    amount?: StrikeDecimalAmount
    targetCurrency?: StrikeCurrency // Currency to convert received funds to
  } // Empty object for default on-chain config; omit for no on-chain address
}

export type StrikeReceiveRequest = {
  receiveRequestId: string // UUID
  created: string // ISO 8601 date-time
  targetCurrency?: StrikeCurrency // Optional, from onchain.targetCurrency
  bolt11?: {
    invoice: string // Bolt11 invoice string
    requestedAmount?: StrikeDecimalAmount
    btcAmount?: string // Converted BTC amount, optional
    description?: string
    descriptionHash?: string // Hex string
    paymentHash: string // Hex string
    expires: string // ISO 8601 date-time
  }
  onchain?: {
    address: string // Bitcoin address
    addressUri: string // Bitcoin URI
    requestedAmount?: StrikeDecimalAmount
    btcAmount?: string // Converted BTC amount, optional
  }
}
