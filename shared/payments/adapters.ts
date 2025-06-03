/**
 * Payment adapters that normalize provider-specific implementations
 */
import type { Invoice, InvoiceRequest, ISO8601DateTime } from './types'
import type { PaymentServiceType } from './constants'

/**
 * Interface that all payment providers must implement
 */
export interface PaymentAdapter {
  /**
   * Service identifier
   */
  readonly serviceType: PaymentServiceType

  /**
   * Creates an invoice from a request
   */
  createInvoice(request: InvoiceRequest): Promise<Invoice>

  /**
   * Checks the status of an invoice
   */
  checkInvoiceStatus(invoiceId: string): Promise<{
    status: Invoice['status']
    paidAt?: ISO8601DateTime
  }>

  /**
   * Cancels an invoice
   */
  cancelInvoice?(invoiceId: string): Promise<boolean>
}

/**
 * Registry of available payment adapters
 */
export class PaymentAdapterRegistry {
  private adapters = new Map<PaymentServiceType, PaymentAdapter>()

  /**
   * Register a payment adapter
   */
  register(adapter: PaymentAdapter): void {
    this.adapters.set(adapter.serviceType, adapter)
  }

  /**
   * Get an adapter by service type
   */
  getAdapter(serviceType: PaymentServiceType): PaymentAdapter | undefined {
    return this.adapters.get(serviceType)
  }

  /**
   * Check if an adapter is registered
   */
  hasAdapter(serviceType: PaymentServiceType): boolean {
    return this.adapters.has(serviceType)
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): PaymentAdapter[] {
    return Array.from(this.adapters.values())
  }
}
