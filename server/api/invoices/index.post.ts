import { nanoid } from 'nanoid'
import type { Invoice, InvoiceRequestWithReceiver } from '~~/lib/general'
import type { StrikeIssueInvoiceRequest } from '~~/lib/strike/api/types'
import { createStrikeInvoiceForReceiver } from '~~/lib/strike/services/invoices'

export default defineEventHandler<{
  body: InvoiceRequestWithReceiver
  response: Invoice
}>(async (event) => {
  await requireUserSession(event)

  const body = await readBody(event)

  switch (body.service) {
    case 'strike': {
      const strikeRequest: StrikeIssueInvoiceRequest = {
        ...body,
        correlationId: `tipbit_${nanoid()}`,
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
})
