import { createError, defineEventHandler, readBody } from 'h3'
import type { Invoice, InvoiceRequestWithReceiver } from '~~/shared/payments/types'
import { StrikeAdapter } from '~~/shared/providers/strike/adapter'

export default defineEventHandler<{
  body: InvoiceRequestWithReceiver
  response: Invoice
}>(async (event) => {
  // TODO: validate body
  const body = await readBody(event)

  switch (body.service) {
    case 'strike': {
      const strikeAdapter = new StrikeAdapter()
      return await strikeAdapter.createInvoice(body)
    }
    default:
      throw createError({
        statusCode: 400,
        message: 'Invalid service',
      })
  }
})
