import { createError, defineEventHandler, getRouterParam } from 'h3'
import { RESERVED_ROUTES } from '../../../app/utils/constants'
import type { ReservedRoute } from '../../../app/utils/constants'
import { mockUserDatabase } from '~~/server/utils/mock-users'

/**
 * API endpoint to get user data by username
 * Returns 404 if username doesn't exist or is reserved
 * GET /api/users/:username
 */
export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username parameter is required',
    })
  }

  // Check if username is in protected routes
  if (RESERVED_ROUTES.includes(username.toLowerCase() as ReservedRoute)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'This username is reserved',
    })
  }

  // Find user in database
  const user = mockUserDatabase.find((user) => user.username.toLowerCase() === username.toLowerCase())

  // If user doesn't exist, return 404
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Username not found',
    })
  }

  // Return user data
  return user
})
