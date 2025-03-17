/**
 * Payment-related validation utilities
 */
import { PaymentServiceTypes, PaymentCurrencies, InvoiceStatusTypes } from './constants'
import type { PaymentServiceType, PaymentService, PaymentCurrency, InvoiceStatus } from './constants'

/**
 * Type guard to check if a value is a valid payment service type
 */
export const isValidPaymentServiceType = (type: string): type is PaymentServiceType => {
  return PaymentServiceTypes.includes(type as PaymentServiceType)
}

/**
 * Type guard to check if a value is a valid payment service
 * Alias for isValidPaymentServiceType for backward compatibility
 */
export const isValidPaymentService = (service: string): service is PaymentService => {
  return PaymentServiceTypes.includes(service as PaymentService)
}

/**
 * Type guard to check if a value is a valid payment currency
 */
export const isValidPaymentCurrency = (currency: string): currency is PaymentCurrency => {
  return PaymentCurrencies.includes(currency as PaymentCurrency)
}

/**
 * Type guard to check if a value is a valid invoice status
 */
export const isValidInvoiceStatus = (status: string): status is InvoiceStatus => {
  return InvoiceStatusTypes.includes(status as InvoiceStatus)
}
