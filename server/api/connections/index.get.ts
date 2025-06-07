import { defineEventHandler } from 'h3'
import { getUserConnections } from '~~/server/utils'

/**
 * Get all payment connections for the authenticated user
 * @route GET /api/connections
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  console.log('user', user)

  const connections = await getUserConnections(user.id)

  return connections
})
