import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { createError, defineEventHandler, getValidatedRouterParams } from 'h3'
import { profilePaymentPreferences } from '~~/server/database/schema'
import { sanitizeStrikeConnection } from '~~/server/utils/security'

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

  // If no profile preferences exist, fall back to user's payment connections
  if (preferences.length === 0) {
    const userConnections = await db.query.paymentConnections.findMany({
      where: (pc) => and(eq(pc.userId, profile.userId), eq(pc.isEnabled, true)),
      with: {
        strikeConnection: true,
        coinosConnection: true,
        albyConnection: true,
      },
      orderBy: (pc) => pc.createdAt,
    })

    return userConnections.map((connection, index) => ({
      id: connection.id, // Use connection ID as preference ID
      profileId,
      connectionId: connection.id,
      priority: index + 1,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
      connection: {
        ...connection,
        strikeConnection: connection.strikeConnection
          ? sanitizeStrikeConnection(connection.strikeConnection)
          : connection.strikeConnection,
      },
    }))
  }

  return preferences.map((pref) => ({
    ...pref,
    connection: pref.connection
      ? {
          ...pref.connection,
          strikeConnection: pref.connection.strikeConnection
            ? sanitizeStrikeConnection(pref.connection.strikeConnection)
            : pref.connection.strikeConnection,
        }
      : pref.connection,
  }))
})
