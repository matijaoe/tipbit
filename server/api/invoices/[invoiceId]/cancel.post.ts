import { z } from 'zod'
import { cancelInvoice } from '~~/shared/providers'

const paramsSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
})

/**
 * Cancel an invoice
 * @route POST /api/invoices/:invoiceId/cancel
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const { invoiceId } = await getValidatedRouterParams(event, paramsSchema.parse)

  const canceledInvoice = await cancelInvoice(invoiceId)

  if (!canceledInvoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found',
    })
  }

  // Return a standardized response
  return canceledInvoice
})
