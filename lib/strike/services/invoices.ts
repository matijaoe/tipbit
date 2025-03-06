import { pick } from 'es-toolkit'
import type { Invoice, InvoiceStatus, ISO8601DateTime } from '../../unified'
import { createQuote, issueInvoice, issueInvoiceForReceiver } from '../api/api'
import type { StrikeIssueInvoiceRequest } from '../api/types'

export async function createStrikeInvoice(request: StrikeIssueInvoiceRequest): Promise<Invoice> {
  const invoice = await issueInvoice(request)
  console.log('🔮', invoice)
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

export async function createStrikeInvoiceForReceiver(
  handle: string,
  request: StrikeIssueInvoiceRequest
): Promise<Invoice> {
  const invoice = await issueInvoiceForReceiver(handle, request)
  console.log('🔮', invoice)
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
