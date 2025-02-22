import { pick } from 'es-toolkit'
import type { Invoice, InvoiceStatus, ISO8601DateTime } from '../../unified'
import { createInvoice, createQuote } from '../api/api'
import type { StrikeCreateInvoiceRequest } from '../api/types'

export async function createStrikeInvoice(request: StrikeCreateInvoiceRequest): Promise<Invoice> {
  const invoice = await createInvoice(request)
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
    status: invoice.state as InvoiceStatus,
    createdAt: invoice.created as ISO8601DateTime,
    expiresAt: quote.expiration as ISO8601DateTime,

    // Optional metadata
    description: invoice.description,

    // Service-specific data
    serviceData: {
      ...pick(invoice, ['correlationId']),
      ...pick(quote, ['quoteId', 'expirationInSec', 'targetAmount', 'sourceAmount', 'conversionRate']),
    },
  }
}
