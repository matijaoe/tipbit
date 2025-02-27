import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { isReservedRoute } from '~/utils/constants'

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

  // Check if username is in protected routes
  if (isReservedRoute(username)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'This username is reserved',
    })
  }

  try {
    const user = await useDB()
      .select()
      .from(tables.users)
      .where(eq(tables.users.username, username))
      .limit(1)
      .then((res) => res[0] || null)

    return user
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user data',
    })
  }
})
