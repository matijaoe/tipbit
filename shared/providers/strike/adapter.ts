/**
 * Strike payment adapter implementation
 */
import { randomUUID } from 'crypto'
import type { PaymentAdapter } from '~~/shared/payments/adapters'
import type { Invoice, InvoiceRequest, InvoiceRequestWithReceiver, ISO8601DateTime } from '~~/shared/payments/types'
import { createQuote, issueInvoice, issueInvoiceForReceiver, getInvoice, cancelInvoice } from './api'
import type { StrikeInvoiceState, StrikeIssueInvoiceRequest } from './types'

/**
 * Map Strike invoice state to our internal invoice status
 */
const mapStrikeStateToInvoiceStatus = (state: StrikeInvoiceState): Invoice['status'] => {
  switch (state) {
    case 'PAID':
      return 'PAID'
    case 'UNPAID':
      return 'PENDING'
    case 'CANCELLED':
      return 'CANCELLED'
    case 'EXPIRED':
      return 'EXPIRED'
    default:
      return 'PENDING'
  }
}

/**
 * Strike payment adapter implementation
 */
export class StrikeAdapter implements PaymentAdapter {
  readonly serviceType = 'strike'

  /**
   * Create an invoice using the Strike API
   */
  async createInvoice(request: InvoiceRequest): Promise<Invoice> {
    const invoiceRequest: StrikeIssueInvoiceRequest = {
      correlationId: randomUUID(),
      description: request.description || 'Tipbit payment',
      amount: {
        amount: request.amount.amount,
        currency: request.amount.currency,
      },
    }

    // For requests with a receiver, use the appropriate API
    if ('receiver' in request) {
      const requestWithReceiver = request as InvoiceRequestWithReceiver
      const invoice = await issueInvoiceForReceiver(requestWithReceiver.receiver, invoiceRequest)
      if (!invoice?.invoiceId) {
        throw createError({
          statusCode: 400,
          message: 'Strike: Failed to create invoice',
        })
      }

      const quote = await createQuote(invoice.invoiceId)
      if (!quote?.lnInvoice) {
        throw createError({
          statusCode: 400,
          message: 'Strike: Failed to generate quote',
        })
      }

      return {
        // Primary identifiers
        invoiceId: invoice.invoiceId,
        service: 'strike',

        // Core payment details
        amount: {
          amount: invoice.amount.amount.toString(),
          currency: invoice.amount.currency,
        },
        lnInvoice: quote.lnInvoice,

        // Status and timing
        status: mapStrikeStateToInvoiceStatus(invoice.state),
        createdAt: invoice.created as ISO8601DateTime,
        expiresAt: quote.expiration as ISO8601DateTime,

        // Optional metadata
        description: invoice.description,

        // Service-specific data
        serviceData: {
          correlationId: invoice.correlationId,
          quoteId: quote.quoteId,
          expirationInSec: quote.expirationInSec,
          targetAmount: quote.targetAmount,
          sourceAmount: quote.sourceAmount,
          conversionRate: quote.conversionRate,
        },
      }
    } else {
      // Regular invoice without receiver
      const invoice = await issueInvoice(invoiceRequest)
      if (!invoice?.invoiceId) {
        throw createError({
          statusCode: 400,
          message: 'Strike: Failed to create invoice',
        })
      }

      const quote = await createQuote(invoice.invoiceId)
      if (!quote?.lnInvoice) {
        throw createError({
          statusCode: 400,
          message: 'Strike: Failed to generate quote',
        })
      }

      return {
        // Primary identifiers
        invoiceId: invoice.invoiceId,
        service: 'strike',

        // Core payment details
        amount: {
          amount: invoice.amount.amount.toString(),
          currency: invoice.amount.currency,
        },
        lnInvoice: quote.lnInvoice,

        // Status and timing
        status: mapStrikeStateToInvoiceStatus(invoice.state),
        createdAt: invoice.created as ISO8601DateTime,
        expiresAt: quote.expiration as ISO8601DateTime,

        // Optional metadata
        description: invoice.description,

        // Service-specific data
        serviceData: {
          correlationId: invoice.correlationId,
          quoteId: quote.quoteId,
          expirationInSec: quote.expirationInSec,
          targetAmount: quote.targetAmount,
          sourceAmount: quote.sourceAmount,
          conversionRate: quote.conversionRate,
        },
      }
    }
  }

  /**
   * Check the status of an invoice
   */
  async checkInvoiceStatus(invoiceId: string): Promise<{
    status: Invoice['status']
    paidAt?: ISO8601DateTime
  }> {
    const invoice = await getInvoice(invoiceId)
    return {
      status: mapStrikeStateToInvoiceStatus(invoice.state),
      // If the invoice is paid, use the created date as paidAt
      // (Strike doesn't provide a separate paidAt field)
      paidAt: invoice.state === 'PAID' ? (invoice.created as ISO8601DateTime) : undefined,
    }
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(invoiceId: string): Promise<boolean> {
    const result = await cancelInvoice(invoiceId)
    return Boolean(result.created)
  }
}
