import { updateConnectionPriorities } from '~~/server/utils'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { createError, defineEventHandler, getValidatedRouterParams, readValidatedBody } from 'h3'

const paramsSchema = z.object({
  profileId: z.string().uuid(),
})

const bodySchema = z.object({
  connectionIds: z.array(z.string().uuid()).min(1, 'At least one connection ID is required'),
})

/**
 * Update the order of payment connections for a profile
 * @route POST /api/profiles/:profileId/connections/order
 */
export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    // Get and validate profile ID from route
    const { profileId } = await getValidatedRouterParams(event, paramsSchema.parse)

    const db = useDB()

    // Verify profile belongs to user
    const profile = await db.query.profiles.findFirst({
      where: (p) => and(eq(p.id, profileId), eq(p.userId, user.id)),
    })

    if (!profile) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Not authorized to modify this profile',
      })
    }

    // Get and validate connection IDs from request body
    const { connectionIds } = await readValidatedBody(event, bodySchema.parse)

    // Update connections order
    const updatedConnections = await updateConnectionPriorities(profileId, connectionIds)

    return updatedConnections
  } catch (error: any) {
    console.error('Error updating connection order:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error updating connection order',
    })
  }
})
