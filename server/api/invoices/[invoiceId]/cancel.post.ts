import { z } from 'zod'
import { cancelInvoice } from '~~/lib/strike/api/api'

const paramsSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
})

/**
 * Cancel an invoice
 * @route POST /api/invoices/:invoiceId/cancel
 */
export default defineEventHandler(async (event) => {
  // Require authentication
  await requireUserSession(event)

  // Get and validate invoice ID from route params
  const { invoiceId } = await getValidatedRouterParams(event, paramsSchema.parse)

  // Cancel the invoice through the Strike API
  const canceledInvoice = await cancelInvoice(invoiceId)

  if (!canceledInvoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found',
    })
  }

  // Return a standardized response
  // TODO: later make sure we are never returning the raw userId on public endpoints
  return canceledInvoice
})
