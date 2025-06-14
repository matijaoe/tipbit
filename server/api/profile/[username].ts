import { eq } from 'drizzle-orm'
import { omit } from 'es-toolkit/compat'
import { createError, defineEventHandler, getValidatedRouterParams } from 'h3'
import { z } from 'zod'
import { users } from '~~/server/database/schema'

const paramsSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
})

/**
 * API endpoint to get user data by username
 * Returns 404 if username doesn't exist or user is not public
 * GET /api/users/:username
 */
export default defineEventHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, paramsSchema.parse)

  const user = await useDB().query.users.findFirst({
    where: eq(users.username, username),
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  // Only return public users for now
  if (!user.isPublic) {
    throw createError({
      statusCode: 403,
      message: 'User profile is private',
    })
  }

  // Return safe user data (excluding sensitive fields)
  return omit(user, ['id', 'identifier', 'role', 'createdAt', 'updatedAt'])
})
