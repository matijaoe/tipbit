import { eq } from 'drizzle-orm'
import { createError, defineEventHandler } from 'h3'
import { z } from 'zod'
import { users } from '~~/server/database/schema'

const paramsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
})

/**
 * API endpoint to get user account by ID
 * Returns 404 if user doesn't exist
 * GET /api/users/:id
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const { id: userId } = await getValidatedRouterParams(event, paramsSchema.parse)

  const user = await useDB().query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  return user
})
