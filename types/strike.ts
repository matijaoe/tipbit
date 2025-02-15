// Request Types
export type StrikeInvoiceAmount = {
  amount: string | number
  currency: StrikeCurrency
}

export type CreateInvoiceRequest = {
  correlationId: string
  description: string
  amount: StrikeInvoiceAmount
}

export type StrikeInvoiceState = 'UNPAID' | 'PAID' | 'CANCELLED' | 'EXPIRED'

// Response Types
export type StrikeInvoice = {
  invoiceId: string
  correlationId: string
  description: string
  amount: StrikeInvoiceAmount
  state: StrikeInvoiceState
  created: string // ISO 8601 timestamp
  lnInvoice?: string // Lightning Network Invoice (BOLT11)
}

// Quote Request Types
export type CreateQuoteRequest = {
  descriptionHash?: string
}

export type StrikeCurrency = 'BTC' | 'USD' | 'EUR' | 'USDT' | 'GBP'

// Quote Response Types
export type StrikeCurrencyAmount = {
  amount: string
  currency: StrikeCurrency
}

export type StrikeConversionRate = {
  amount: string
  sourceCurrency: StrikeCurrency
  targetCurrency: StrikeCurrency
}

export type CreateQuoteResponse = {
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
