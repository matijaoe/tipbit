/**
 * Payment-related constants and types
 */

// Payment service types
export const PaymentServiceTypes = ['strike', 'coinos', 'alby'] as const
export type PaymentServiceType = (typeof PaymentServiceTypes)[number]

// Payment service type alias for backward compatibility
export type PaymentService = PaymentServiceType

// Payment currencies
export const PaymentCurrencies = ['BTC', 'USD', 'EUR', 'USDT', 'GBP'] as const
export type PaymentCurrency = (typeof PaymentCurrencies)[number]

// Invoice statuses
export const InvoiceStatusTypes = ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'] as const
export type InvoiceStatus = (typeof InvoiceStatusTypes)[number]
