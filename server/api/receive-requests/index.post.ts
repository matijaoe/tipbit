import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { createReceiveRequest } from '~~/shared/providers/strike/api'
import type { StrikeCreateReceiveRequest, StrikeReceiveRequest } from '~~/shared/providers/strike/types'

export default defineEventHandler<{
  body: StrikeCreateReceiveRequest & { connectionId: string }
  response: StrikeReceiveRequest
}>(async (event) => {
  // No user session required - this is for public payments
  const body = await readBody(event)
  const { connectionId, ...receiveRequestData } = body

  if (!connectionId) {
    throw createError({
      statusCode: 400,
      message: 'Connection ID is required',
    })
  }

  // Get the Strike connection with encrypted API key (no user restriction for public payments)
  const db = useDB()
  const connection = await db.query.paymentConnections.findFirst({
    where: (pc) => and(eq(pc.id, connectionId), eq(pc.serviceType, 'strike')),
    with: {
      strikeConnection: true,
    },
  })

  if (!connection) {
    throw createError({
      statusCode: 404,
      message: 'Strike connection not found',
    })
  }

  if (!connection.strikeConnection?.apiKey) {
    throw createError({
      statusCode: 400,
      message: 'Strike API key required for receive requests',
    })
  }

  // Create receive request using the Strike API with the encrypted API key
  const receiveRequest = await createReceiveRequest(receiveRequestData, {
    encryptedUserKey: connection.strikeConnection.apiKey,
  })

  return receiveRequest
})
