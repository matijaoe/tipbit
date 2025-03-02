import type { StrikeInvoice, StrikeQuote } from '../strike/api/types'

export type ISO8601DateTime = string & { readonly _brand: 'ISO8601' }

export type PaymentCurrency = 'BTC' | 'USD' | 'EUR' | 'USDT' | 'GBP'
export type InvoiceStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'

export type PaymentService = 'strike'

export type InvoiceAmount = {
  amount: string
  currency: PaymentCurrency
}

// request

export type InvoiceRequest = {
  service: PaymentService
  amount: InvoiceAmount
  description?: string
}

// response

type StrikeServiceData = Pick<StrikeInvoice, 'correlationId'> &
  Pick<StrikeQuote, 'quoteId' | 'expirationInSec' | 'targetAmount' | 'sourceAmount' | 'conversionRate'>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type CoinosServiceData = {
  // Coinos specific fields
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type AlbyServiceData = {
  // Alby specific fields
}

export type Invoice = {
  // Primary identifiers
  invoiceId: string

  // Core payment details
  amount: InvoiceAmount
  lnInvoice: string

  // Status and timing
  status: InvoiceStatus
  createdAt: ISO8601DateTime
  expiresAt: ISO8601DateTime

  // Optional metadata
  description?: string
} & (
  | { service: 'strike'; serviceData: StrikeServiceData }
  | { service: 'coinos'; serviceData: CoinosServiceData }
  | { service: 'alby'; serviceData: AlbyServiceData }
)
