/**
 * Common payment types used across the application
 */
import type { StrikeInvoice, StrikeQuote } from '../providers'
import type { InvoiceStatus, PaymentCurrency, PaymentService } from './constants'

/**
 * ISO8601 formatted date-time string
 */
export type ISO8601DateTime = string & { readonly _brand: 'ISO8601' }

/**
 * Amount with currency
 */
export type InvoiceAmount = {
  amount: string
  currency: PaymentCurrency
}

/**
 * Base invoice request
 */
export type InvoiceRequest = {
  service: PaymentService
  amount: InvoiceAmount
  description?: string
}

/**
 * Invoice request with a specific receiver
 */
export type InvoiceRequestWithReceiver = InvoiceRequest & {
  receiver: string
}

/**
 * Provider-specific service data types
 */
export type StrikeServiceData = Pick<StrikeInvoice, 'correlationId'> &
  Pick<StrikeQuote, 'quoteId' | 'expirationInSec' | 'targetAmount' | 'sourceAmount' | 'conversionRate'>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CoinosServiceData = {
  // Coinos specific fields
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlbyServiceData = {
  // Alby specific fields
}

/**
 * Unified invoice type with provider-specific data
 */
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
