import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { profiles } from '~~/server/database/schema'

/**
 * API endpoint to get profile data by handle
 * Returns 404 if handle doesn't exist
 * GET /api/profiles/:handle
 */
export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')

  if (!handle) {
    throw createError({
      statusCode: 400,
      message: 'Profile handle is required',
    })
  }

  try {
    const profile = await useDB().query.profiles.findFirst({
      where: eq(profiles.handle, handle),
      with: {
        user: {
          with: {
            strikeConnection: true,
          },
        },
      },
    })

    // Transform the result
    const transformedProfile = profile
      ? {
          ...profile,
          strikeHandle: profile.user.strikeConnection?.handle,
          // Remove user data
          user: undefined,
        }
      : null

    if (!transformedProfile) {
      throw createError({
        statusCode: 404,
        message: 'Profile not found',
      })
    }

    return transformedProfile
  } catch (error) {
    console.error(`Error fetching profile with handle ${handle}:`, error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch profile data',
    })
  }
})
