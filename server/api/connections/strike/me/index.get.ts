import { z } from 'zod'
import { fetchProfileById } from '~~/lib/strike/api/api'
import { strikeConnections } from '~~/server/database/schema'

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

  const _connection = await db.query.strikeConnections.findFirst({
    where: eq(strikeConnections.userId, user.id),
  })

  if (!_connection) {
    createError({
      statusCode: 404,
      statusMessage: 'Connection not found',
    })
    return null
  }

  const sanitizedConnection = sanitizeStrikeConnection(_connection)

  if (withProfile) {
    const encryptedUserKey = _connection.apiKey

    const profile = await fetchProfileById(
      _connection.strikeProfileId,
      encryptedUserKey ? { encryptedUserKey } : undefined
    )

    return {
      ...sanitizedConnection,
      profile,
    }
  }

  return sanitizedConnection
})
