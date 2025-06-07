import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, getValidatedRouterParams } from 'h3'
import { z } from 'zod'
import { users, userPaymentPreferences, paymentConnections } from '~~/server/database/schema'
import { sanitizeConnections } from '~~/server/utils/security'

const paramsSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
})

/**
 * API endpoint to get user payment connections by username
 * Returns connections ordered by priority
 * GET /api/users/:username/connections
 */
export default defineEventHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, paramsSchema.parse)

  // First, find the user
  const user = await useDB().query.users.findFirst({
    where: eq(users.username, username),
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  // Only return connections for public users
  if (!user.isPublic) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  // TODO: later
  // // Get user payment preferences with connections
  // const preferences = await useDB().query.userPaymentPreferences.findMany({
  //   where: eq(userPaymentPreferences.userId, user.id),
  //   with: {
  //     connection: {
  //       with: {
  //         strikeConnection: true,
  //       },
  //     },
  //   },
  //   orderBy: (preferences, { asc }) => [asc(preferences.priority)],
  // })

  const connections = await useDB().query.paymentConnections.findMany({
    where: eq(paymentConnections.userId, user.id),
    with: {
      strikeConnection: true,
    },
  })

  return connections.map((connection) => ({
    ...connection,
    connection: {
      ...connection,
      strikeConnection: connection.strikeConnection ? sanitizeStrikeConnection(connection.strikeConnection) : null,
    },
  }))
})
