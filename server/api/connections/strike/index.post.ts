import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, H3Error, readValidatedBody } from 'h3'
import { z } from 'zod'
import { paymentConnections, strikeConnections } from '~~/server/database/schema'
import type { StrikeServiceData } from '~~/server/utils/payment-connections'
import { strikeHandleSchema } from '~~/server/utils/schemas'
import { fetchProfileByHandle } from '~~/shared/providers'

const strikeConnectionSchema = z.object({
  handle: strikeHandleSchema,
  apiKey: z.string().optional(),
  name: z.string().optional(),
  connectionId: z.string().uuid().optional(),
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
    // Get and validate data from request body
    const { handle, apiKey, name, connectionId } = await readValidatedBody(event, strikeConnectionSchema.parse)

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

    // Process API key if provided
    let decryptedClientApiKey: string | null = null
    if (apiKey) {
      try {
        // Decrypt the client-encrypted API key
        decryptedClientApiKey = await decryptFromClient(apiKey)
      } catch (error) {
        console.error('Error processing Strike API key:', error)
        throw createError({
          statusCode: 500,
          message: 'Failed to process API key',
        })
      }
    }

    // Prepare Strike service data
    const strikeServiceData: StrikeServiceData = {
      strikeProfileId: accountProfile.id,
      apiKey: decryptedClientApiKey,
    }

    // TODO: this should be greatly simplified

    const db = useDB()

    // Transaction to handle connection updates or creation in a single DB operation
    const connection = await db.transaction(async (tx) => {
      // If we're editing an existing connection
      if (connectionId) {
        // Get the specific connection we're editing
        const existingConnection = await tx.query.paymentConnections.findFirst({
          where: (pc) => and(eq(pc.id, connectionId), eq(pc.userId, user.id), eq(pc.serviceType, 'strike')),
          with: {
            strikeConnection: true,
          },
        })

        if (!existingConnection) {
          throw createError({
            statusCode: 404,
            message: 'Connection not found or not authorized to edit',
          })
        }

        // Check if we're changing the Strike profile
        const isSameStrikeProfile = existingConnection.strikeConnection?.strikeProfileId === accountProfile.id

        if (isSameStrikeProfile) {
          // Just update the existing connection
          return await updatePaymentConnection(
            connectionId,
            {
              name: name || `Strike (${handle})`,
            },
            {
              apiKey: decryptedClientApiKey,
            },
            tx
          )
        } else {
          // Different profile ID - delete the old connection
          await tx.delete(paymentConnections).where(eq(paymentConnections.id, connectionId))

          // Create a new one
          const [newConnection] = await tx
            .insert(paymentConnections)
            .values({
              userId: user.id,
              serviceType: 'strike',
              name: name || `Strike (${handle})`,
              isEnabled: true,
            })
            .returning()

          // Add the Strike-specific data
          await tx.insert(strikeConnections).values({
            connectionId: newConnection.id,
            strikeProfileId: accountProfile.id,
            apiKey: decryptedClientApiKey ? await encryptForStorage(decryptedClientApiKey) : null,
          })

          return newConnection
        }
      } else {
        // We're creating a new connection

        // Check if we already have a connection with this Strike profile
        const existingConnection = await tx.query.paymentConnections.findFirst({
          where: (pc) => and(eq(pc.userId, user.id), eq(pc.serviceType, 'strike')),
          with: {
            strikeConnection: true,
          },
        })

        // Check if this connection has the same Strike profile ID
        const isSameStrikeProfile = existingConnection?.strikeConnection?.strikeProfileId === accountProfile.id
        if (existingConnection && isSameStrikeProfile) {
          // Update the existing connection with the same Strike profile
          return await updatePaymentConnection(
            existingConnection.id,
            {
              name: name || `Strike (${handle})`,
            },
            {
              apiKey: decryptedClientApiKey,
            },
            tx
          )
        } else {
          // Create a new connection
          return await createPaymentConnection(
            user.id,
            'strike',
            strikeServiceData,
            { name: name || `Strike (${handle})` },
            // TODO: simplify this so we don't need to pass tx
            tx
          )
        }
      }
    })

    return {
      ...connection,
      hasApiKey: !!decryptedClientApiKey,
    }
  } catch (error) {
    console.error('Error connecting Strike account:', error)

    if (error instanceof H3Error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to connect Strike account',
    })
  }
})
