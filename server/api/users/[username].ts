import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { isReservedRoute } from '~/utils/constants'
import { users } from '~~/server/database/schema'

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
      message: 'Username is required',
    })
  }

  // Check if username is in reserved routes
  if (isReservedRoute(username)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'This username is reserved',
    })
  }

  try {
    const user = await useDB().query.users.findFirst({
      where: eq(users.username, username),
    })

    return user
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user data',
    })
  }
})
