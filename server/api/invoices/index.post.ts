import type { H3Error } from 'h3'
import { nanoid } from 'nanoid'
import type { StrikeIssueInvoiceRequest } from '~~/lib/strike/api/types'
import { createStrikeInvoiceForReceiver } from '~~/lib/strike/services/invoices'
import type { Invoice, InvoiceRequestWithReceiver } from '~~/lib/general'

export default defineEventHandler<{
  body: InvoiceRequestWithReceiver
  response: Invoice
}>(async (event) => {
  await requireUserSession(event)

  const body = await readBody(event)

  try {
    switch (body.service) {
      case 'strike': {
        const strikeRequest: StrikeIssueInvoiceRequest = {
          ...body,
          correlationId: `tipbit-${nanoid()}`,
          description: body.description || '',
        }
        const response = await createStrikeInvoiceForReceiver(body.receiver, strikeRequest)
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
