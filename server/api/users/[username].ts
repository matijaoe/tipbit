import { eq } from 'drizzle-orm'
import { createError, defineEventHandler } from 'h3'
import { z, ZodError } from 'zod'
import { isReservedRoute } from '~/utils/constants'
import { users } from '~~/server/database/schema'

const paramsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens')
    .refine((username) => !isReservedRoute(username), {
      message: 'This username is reserved keyword and cannot be used',
      params: {
        statusCode: 404,
      },
    }),
})

/**
 * API endpoint to get user data by username
 * Returns 404 if username doesn't exist or is reserved
 * GET /api/users/:username
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

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

  return user
})
