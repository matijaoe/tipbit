import { and, desc, eq } from 'drizzle-orm'
import { omit } from 'es-toolkit'
import { z } from 'zod'
import { fetchProfileById } from '~~/lib/strike/api/api'

const querySchema = z.object({
  withProfile: z.union([
    z.literal('true').transform(() => true),
    z.literal('1').transform(() => true),
    z
      .string()
      .optional()
      .transform(() => undefined),
  ]),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const { withProfile } = await getValidatedQuery(event, querySchema.parse)

  const db = useDB()

  // Find Strike connection through the payment connections table
  const connection = await db.query.paymentConnections.findFirst({
    where: (pc) => and(eq(pc.userId, user.id), eq(pc.serviceType, 'strike'), eq(pc.isEnabled, true)),
    with: {
      strikeConnection: true,
    },
    // just in case there are multiple connections, get the latest one (but there shouldn't be)
    orderBy: (pc) => [desc(pc.createdAt)],
  })

  if (!connection || !connection.strikeConnection) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Connection not found',
    })
  }

  if (withProfile) {
    const encryptedUserKey = connection.strikeConnection.apiKey

    const profile = await fetchProfileById(
      connection.strikeConnection.strikeProfileId,
      encryptedUserKey ? { encryptedUserKey } : undefined
    )

    const strikeConnection = {
      ...omit(connection.strikeConnection, ['apiKey']),
      hasApiKey: !!encryptedUserKey,
    }

    return {
      ...connection,
      strikeConnection,
      profile,
    }
  }

  return connection
})
