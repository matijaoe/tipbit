import { and, eq } from 'drizzle-orm'
import { createReceiveRequest } from '~~/shared/providers/strike/api'
import type { StrikeCreateReceiveRequest, StrikeReceiveRequest } from '~~/shared/providers/strike/types'

export default defineEventHandler<{
  body: StrikeCreateReceiveRequest & { connectionId: string }
  response: StrikeReceiveRequest
}>(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await readBody(event)
  const { connectionId, ...receiveRequestData } = body

  if (!connectionId) {
    throw createError({
      statusCode: 400,
      message: 'Connection ID is required',
    })
  }

  // Get the Strike connection with encrypted API key
  const db = useDB()
  const connection = await db.query.paymentConnections.findFirst({
    where: (pc) => and(eq(pc.id, connectionId), eq(pc.userId, user.id), eq(pc.serviceType, 'strike')),
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
