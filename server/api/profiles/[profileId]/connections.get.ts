import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createError, defineEventHandler, getValidatedRouterParams } from 'h3'
import { profilePaymentPreferences } from '~~/server/database/schema'

const paramsSchema = z.object({
  profileId: z.string().uuid(),
})

/**
 * Get all payment connections for a profile with priority order
 * @route GET /api/profiles/:profileId/connections
 */
export default defineEventHandler(async (event) => {
  const { profileId } = await getValidatedRouterParams(event, paramsSchema.parse)

  const db = useDB()

  const profile = await db.query.profiles.findFirst({
    where: (p) => eq(p.id, profileId),
  })

  if (!profile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found',
    })
  }

  const preferences = await db.query.profilePaymentPreferences.findMany({
    where: eq(profilePaymentPreferences.profileId, profileId),
    orderBy: (pref) => pref.priority,
    with: {
      connection: {
        with: {
          strikeConnection: true,
          coinosConnection: true,
          albyConnection: true,
        },
      },
    },
  })

  return preferences
})
