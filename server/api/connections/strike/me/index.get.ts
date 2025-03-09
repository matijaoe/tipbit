import { fetchProfileById } from '~~/lib/strike/api/api'
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

  try {
    if (withProfile && connection) {
      const profile = await fetchProfileById(connection.strikeProfileId)

      const connectionWithProfile = {
        ...connection,
        profile,
      }

      return connectionWithProfile
    }
  } catch (err) {
    console.error('Error fetching Strike profile', err)
  }

  return connection
})
