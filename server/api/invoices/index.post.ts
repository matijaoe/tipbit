import type { H3Error } from 'h3'
import { nanoid } from 'nanoid'
import type { StrikeCreateInvoiceRequest } from '~~/lib/strike/api/types'
import { createStrikeInvoice } from '~~/lib/strike/services/invoices'
import type { Invoice, InvoiceRequest } from '~~/lib/unified'

export default defineEventHandler<{
  body: InvoiceRequest
  response: Invoice
}>(async (event) => {
  const body = await readBody(event)

  try {
    switch (body.service) {
      case 'strike': {
        const strikeRequest: StrikeCreateInvoiceRequest = {
          ...body,
          correlationId: `tipbit-${nanoid()}`,
          description: body.description || '',
        }
        const response = await createStrikeInvoice(strikeRequest)
        return response
      }
      default:
        throw createError({
          statusCode: 400,
          message: 'Invalid service',
        })
    }
  } catch (error) {
    const h3Error = error as H3Error
    throw createError({
      statusCode: h3Error.statusCode || 500,
      message: h3Error.message || 'Failed to process invoice request',
    })
  }
})
