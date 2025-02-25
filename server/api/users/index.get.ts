import { defineEventHandler } from 'h3'
import { mockUserDatabase } from '~~/server/utils/mock-users'

/**
 * API endpoint to get all users
 * GET /api/users
 */
export default defineEventHandler(async () => {
  // Return all users
  return mockUserDatabase
})
