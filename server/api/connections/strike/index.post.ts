import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { fetchProfileByHandle } from '~~/lib/strike/api/api'
import { strikeConnections } from '~~/server/database/schema'
import { encryptForStorage } from '~~/server/utils/encryption'

// Updated schema to always require handle, with optional apiKey
const strikeConnectionSchema = z.object({
  handle: z.string().min(1),
  apiKey: z.string().optional(),
})

export type StrikeConnectionRequestBody = z.infer<typeof strikeConnectionSchema>

/**
 * API endpoint to connect a Strike account to a user
 * POST /api/connections/strike
 * Requires authentication
 */
export default defineEventHandler(async (event) => {
  // Require user session
  const { user } = await requireUserSession(event)

  try {
    // Validate request body
    const body = await readBody(event)
    const validatedBody = strikeConnectionSchema.parse(body)
    const { handle, apiKey } = validatedBody

    const db = useDB()

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

    // Check if user already has a Strike connection
    const existingConnection = await db.query.strikeConnections.findFirst({
      where: eq(strikeConnections.userId, user.id),
    })

    // Process API key if provided
    let encryptedApiKey = null
    if (apiKey) {
      try {
        // Encrypt the API key for storage
        // We can't validate the API key without a dedicated function,
        // so we'll just encrypt and store it
        // TODO: validate that api key matched the handle, in some hacky way
        // if doesn't match, still allow to connect via handle only
        const decryptedClientApiKey = await decryptFromClient(apiKey)
        encryptedApiKey = await encryptForStorage(decryptedClientApiKey)
      } catch (error) {
        console.error('Error processing Strike API key:', error)
        throw createError({
          statusCode: 500,
          message: 'Failed to process API key',
        })
      }
    }

    if (existingConnection) {
      // Update existing connection
      const [updatedConnection] = await db
        .update(strikeConnections)
        .set({
          strikeProfileId: accountProfile.id,
          apiKey: encryptedApiKey,
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
          strikeProfileId: accountProfile.id,
          apiKey: encryptedApiKey,
        })
        .returning()

      return newConnection
    }
  } catch (error) {
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
