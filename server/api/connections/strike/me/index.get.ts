import { fetchProfileById, fetchProfileWithConnection } from '~~/lib/strike/api/api'
import { strikeConnections } from '~~/server/database/schema'
import { z } from 'zod'

const querySchema = z.object({
  profile: z.coerce.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const { profile: withProfile } = await getValidatedQuery(event, querySchema.parse)

  const db = useDB()

  const connection = await db.query.strikeConnections.findFirst({
    where: eq(strikeConnections.userId, user.id),
  })

  if (!connection) {
    return null
  }

  // Don't expose the encrypted API key to the client
  const sanitizedConnection = {
    ...connection,
    // Replace actual API key with a boolean indicating if one exists
    apiKey: connection.apiKey ? true : undefined,
  }

  try {
    if (withProfile && connection) {
      let profile

      if (connection.apiKey) {
        // Fetch profile using the user's API key
        profile = await fetchProfileWithConnection(
          connection.strikeProfileId,
          false, // Not a handle
          { type: 'api_key', apiKey: connection.apiKey }
        )
      } else {
        // Fetch profile using the global API key
        profile = await fetchProfileById(connection.strikeProfileId)
      }

      const connectionWithProfile = {
        ...sanitizedConnection,
        profile,
      }

      return connectionWithProfile
    }
  } catch (err) {
    console.error('Error fetching Strike profile', err)
  }

  return sanitizedConnection
})
