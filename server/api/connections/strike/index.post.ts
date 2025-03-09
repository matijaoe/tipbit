import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { fetchProfileByHandle } from '~~/lib/strike/api/api'
import { strikeConnections } from '~~/server/database/schema'

/**
 * API endpoint to connect a Strike account to a user
 * POST /api/connections/strike
 * Requires authentication
 */
export default defineEventHandler(async (event) => {
  // Require user session
  const { user } = await requireUserSession(event)

  // Get handle from request body
  const { handle } = await readBody(event)

  if (!handle) {
    throw createError({
      statusCode: 400,
      message: 'Strike handle is required',
    })
  }

  try {
    // Verify handle exists on Strike
    const accountProfile = await fetchProfileByHandle(handle)

    if (!accountProfile) {
      throw createError({
        statusCode: 404,
        message: 'Strike account not found',
      })
    }

    if (!accountProfile.canReceive) {
      throw createError({
        statusCode: 400,
        message: 'This Strike account cannot receive payments',
      })
    }

    const db = useDB()

    // Check if user already has a Strike connection
    const existingConnection = await db.query.strikeConnections.findFirst({
      where: eq(strikeConnections.userId, user.id),
    })

    if (existingConnection) {
      // Update existing connection
      const [updatedConnection] = await db
        .update(strikeConnections)
        .set({
          handle: accountProfile.handle,
          receiverId: accountProfile.id,
          updatedAt: new Date(),
        })
        .where(eq(strikeConnections.userId, user.id))
        .returning()

      return updatedConnection
    } else {
      // Create new connection
      const [newConnection] = await db
        .insert(strikeConnections)
        .values({
          userId: user.id,
          handle: accountProfile.handle,
          receiverId: accountProfile.id,
        })
        .returning()

      return newConnection
    }
  } catch (error: unknown) {
    console.error('Error connecting Strike account:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to connect Strike account',
    })
  }
})
