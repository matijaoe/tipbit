import { eq } from 'drizzle-orm'
import { omit } from 'es-toolkit/compat'
import { createError, defineEventHandler, getValidatedRouterParams } from 'h3'
import { z } from 'zod'
import { profiles } from '~~/server/database/schema'
import { handleSchema } from '~~/server/utils/schemas'

const paramsSchema = z.object({
  handle: handleSchema,
})

/**
 * API endpoint to get profile data by handle
 * Returns 404 if handle doesn't exist
 * GET /api/profiles/:handle
 */
export default defineEventHandler(async (event) => {
  const { handle } = await getValidatedRouterParams(event, paramsSchema.parse)

  const profile = await useDB().query.profiles.findFirst({
    where: eq(profiles.handle, handle),
  })

  if (!profile) {
    throw createError({
      statusCode: 404,
      message: 'Profile not found',
    })
  }

  const transformedProfile = omit(profile, ['userId'])

  return transformedProfile
})
