import { defineEventHandler } from 'h3'

/**
 * API endpoint to get all users
 * GET /api/users
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  return useDB().query.users.findMany()
})
