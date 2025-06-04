import { isObject } from 'es-toolkit/compat'
import { defineEventHandler, readValidatedBody } from 'h3'
import { z } from 'zod'
import type { AlbyServiceData, CoinosServiceData, StrikeServiceData } from '~~/server/utils'
import { createPaymentConnection } from '~~/server/utils'
import { PaymentServiceTypes, type PaymentServiceType } from '~~/shared/payments/constants'

const bodySchema = z.object({
  serviceType: z.enum(PaymentServiceTypes),
  name: z.string().optional(),
  serviceData: z.record(z.unknown()).refine((val) => val != null && isObject(val), {
    message: 'serviceData must be an object',
  }),
})

/**
 * Create a new payment connection
 * @route POST /api/connections/create
 */
export default defineEventHandler(async (event) => {
  // Ensure user is authenticated
  const { user } = await requireUserSession(event)

  // Get and validate data from request body
  const { serviceType, name, serviceData } = await readValidatedBody(event, bodySchema.parse)

  // Create the connection
  const connection = await createPaymentConnection(
    user.id,
    serviceType as PaymentServiceType,
    serviceData as unknown as StrikeServiceData | CoinosServiceData | AlbyServiceData,
    {
      name,
    }
  )

  return connection
})
