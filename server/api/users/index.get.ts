import { defineEventHandler } from 'h3'

/**
 * API endpoint to get all users
 * GET /api/users
 */
export default defineEventHandler(async () => {
  // Return all users
  return useDB().select().from(tables.users)
})
