import { and, eq, sql } from 'drizzle-orm'
import { isEmpty } from 'es-toolkit/compat'
import type { PaymentServiceType } from '~~/shared/payments/constants'
import {
  albyConnections,
  coinosConnections,
  paymentConnections,
  profilePaymentPreferences,
  profiles,
  strikeConnections,
} from '../database/schema'
import { encryptForStorage } from './encryption'

// Service-specific data interfaces
// TODO: Can we infer the type from the schema and pick specific types we need, or omit the ones we don't need?
export interface StrikeServiceData {
  strikeProfileId: string
  handle: string
  apiKey?: string | null
}

export interface CoinosServiceData {
  coinosUsername: string
  apiKey: string
}

export interface AlbyServiceData {
  albyId: string
  accessToken: string
  refreshToken?: string | null
}

/**
 * Get all enabled payment connections for a user with service details
 */
export const getUserConnections = async (userId: string) => {
  const db = useDB()
  const connections = await db.query.paymentConnections.findMany({
    where: (pc) => and(eq(pc.userId, userId), eq(pc.isEnabled, true)),
    with: {
      strikeConnection: true,
      coinosConnection: true,
      albyConnection: true,
      // Add more as you implement them
    },
    orderBy: (pc) => pc.createdAt,
  })

  return connections
}

/**
 * Update priorities based on new order
 * connectionIds should be an array of connection IDs in the desired order
 */
export const updateConnectionPriorities = async (profileId: string, connectionIds: string[]) => {
  const db = useDB()
  // Start a transaction to ensure all updates happen together
  return await db.transaction(async (tx) => {
    // Delete existing preferences for this profile
    await tx.delete(profilePaymentPreferences).where(eq(profilePaymentPreferences.profileId, profileId))

    // Insert new preferences with updated priorities
    const newPreferences = connectionIds.map((connectionId, index) => ({
      profileId,
      connectionId,
      priority: index + 1, // 1-based priority (1 is highest)
    }))

    return await tx.insert(profilePaymentPreferences).values(newPreferences).returning()
  })
}

/**
 * Get the highest priority enabled payment connection for a profile
 */
export const getProfileActiveConnection = async (profileId: string) => {
  const db = useDB()
  // First, get the profile's payment preferences in priority order
  const preferences = await db.query.profilePaymentPreferences.findMany({
    where: eq(profilePaymentPreferences.profileId, profileId),
    orderBy: (pref) => pref.priority,
    with: {
      connection: {
        with: {
          strikeConnection: true,
          coinosConnection: true,
          albyConnection: true,
          // Add more as you implement them
        },
      },
    },
  })

  // Find the first enabled connection
  const activePreference = preferences.find((pref) => pref.connection && pref.connection.isEnabled)

  if (!activePreference) {
    return null // No enabled payment connections
  }

  // Determine which service-specific connection to use based on type
  const { connection } = activePreference

  switch (connection.serviceType) {
    case 'strike':
      return {
        serviceType: 'strike' as PaymentServiceType,
        connectionData: connection.strikeConnection,
        // You could add service-specific helper methods here
        generateInvoice: async (amount: number, currency: string) => {
          // Strike-specific invoice generation logic
          // Will implement this later
          return { id: 'temp-invoice-id', amount, currency }
        },
      }
    case 'coinos':
      return {
        serviceType: 'coinos' as PaymentServiceType,
        connectionData: connection.coinosConnection,
        // Coinos-specific helpers
        generateInvoice: async (amount: number, currency: string) => {
          // Coinos-specific invoice generation logic
          // Will implement this later
          return { id: 'temp-invoice-id', amount, currency }
        },
      }
    case 'alby':
      return {
        serviceType: 'alby' as PaymentServiceType,
        connectionData: connection.albyConnection,
        // Alby-specific helpers
        generateInvoice: async (amount: number, currency: string) => {
          // Alby-specific invoice generation logic
          // Will implement this later
          return { id: 'temp-invoice-id', amount, currency }
        },
      }
    default:
      return null
  }
}

/**
 * Check if a user has any payment connections set up
 */
export const hasPaymentConnections = async (userId: string) => {
  const db = useDB()
  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(paymentConnections)
    .where(eq(paymentConnections.userId, userId))
    .execute()

  return count[0].count > 0
}

/**
 * Get all profiles with their payment preferences
 */
export const getProfilesWithPaymentPreferences = async (userId: string) => {
  const db = useDB()
  return await db.query.profiles.findMany({
    where: eq(profiles.userId, userId),
    with: {
      paymentPreferences: {
        with: {
          connection: true,
        },
        orderBy: (pref) => pref.priority,
      },
    },
  })
}

// TODO: infer from schema
type ConnectionData = {
  name?: string
  isEnabled?: boolean
}

/**
 * Update an existing payment connection
 * @param connectionId ID of the connection to update
 * @param connectionData Partial connection data to update
 * @param serviceData Service-specific data to update
 * @param tx Optional transaction to use instead of creating a new one
 * @returns The updated connection record
 */
export const updatePaymentConnection = async (
  connectionId: string,
  connectionData?: Partial<ConnectionData>,
  serviceData?: Partial<StrikeServiceData> | Partial<CoinosServiceData> | Partial<AlbyServiceData>,
  tx?: any // Transaction parameter
) => {
  const db = useDB()
  // Function to perform the update
  const performUpdate = async (dbTx: any) => {
    // First, get the connection to check its type and verify it exists
    const connection = await dbTx.query.paymentConnections.findFirst({
      where: eq(paymentConnections.id, connectionId),
      with: {
        strikeConnection: true,
        coinosConnection: true,
        albyConnection: true,
      },
    })

    if (!connection) {
      throw new Error(`Connection with ID ${connectionId} not found`)
    }

    // Update base connection if data is provided
    if (!isEmpty(connectionData)) {
      await dbTx
        .update(paymentConnections)
        .set({
          ...connectionData,
          updatedAt: new Date(),
        })
        .where(eq(paymentConnections.id, connectionId))
    }

    // Update service-specific data if provided
    if (serviceData) {
      switch (connection.serviceType) {
        case 'strike': {
          const strikeData = serviceData as Partial<StrikeServiceData>
          if (strikeData.apiKey !== undefined) {
            // Encrypt API key if provided
            const encryptedApiKey = strikeData.apiKey ? await encryptForStorage(strikeData.apiKey) : null
            await dbTx
              .update(strikeConnections)
              .set({
                apiKey: encryptedApiKey,
                updatedAt: new Date(),
              })
              .where(eq(strikeConnections.connectionId, connectionId))
          }
          break
        }
        case 'coinos': {
          const coinosData = serviceData as Partial<CoinosServiceData>
          if (coinosData.apiKey) {
            await dbTx
              .update(coinosConnections)
              .set({
                apiKey: await encryptForStorage(coinosData.apiKey),
                updatedAt: new Date(),
              })
              .where(eq(coinosConnections.connectionId, connectionId))
          }
          break
        }
        case 'alby': {
          const albyData = serviceData as Partial<AlbyServiceData>
          const updates: Record<string, any> = { updatedAt: new Date() }

          if (albyData.accessToken) {
            updates.accessToken = await encryptForStorage(albyData.accessToken)
          }

          if (albyData.refreshToken !== undefined) {
            updates.refreshToken = albyData.refreshToken ? await encryptForStorage(albyData.refreshToken) : null
          }

          if (Object.keys(updates).length > 1) {
            // More than just updatedAt
            await dbTx.update(albyConnections).set(updates).where(eq(albyConnections.connectionId, connectionId))
          }
          break
        }
      }
    }

    // Return the updated connection
    const [updatedConnection] = await dbTx
      .select()
      .from(paymentConnections)
      .where(eq(paymentConnections.id, connectionId))
      .limit(1)

    return updatedConnection
  }

  // If a transaction is provided, use it; otherwise create a new one
  if (tx) {
    return await performUpdate(tx)
  } else {
    return await db.transaction(performUpdate)
  }
}

/**
 * Create a new payment connection
 */
export const createPaymentConnection = async (
  userId: string,
  serviceType: PaymentServiceType,
  serviceData: StrikeServiceData | CoinosServiceData | AlbyServiceData,
  connectionData?: ConnectionData,
  tx?: any // Transaction parameter
) => {
  const db = useDB()
  // Function to perform the creation
  const performCreate = async (dbTx: any) => {
    // Create the base payment connection
    const [connection] = await dbTx
      .insert(paymentConnections)
      .values({
        userId,
        serviceType,
        isEnabled: true,
        ...connectionData,
      })
      .returning()

    // Based on service type, create the specific connection
    switch (serviceType) {
      case 'strike': {
        const strikeData = serviceData as StrikeServiceData

        // Encrypt API key if provided
        let encryptedApiKey = null
        if (strikeData.apiKey) {
          encryptedApiKey = await encryptForStorage(strikeData.apiKey)
        }

        await dbTx.insert(strikeConnections).values({
          connectionId: connection.id,
          strikeProfileId: strikeData.strikeProfileId,
          handle: strikeData.handle,
          apiKey: encryptedApiKey,
        })
        break
      }
      case 'coinos': {
        const coinosData = serviceData as CoinosServiceData
        await dbTx.insert(coinosConnections).values({
          connectionId: connection.id,
          coinosUsername: coinosData.coinosUsername,
          apiKey: await encryptForStorage(coinosData.apiKey),
        })
        break
      }
      case 'alby': {
        const albyData = serviceData as AlbyServiceData
        await dbTx.insert(albyConnections).values({
          connectionId: connection.id,
          albyId: albyData.albyId,
          accessToken: await encryptForStorage(albyData.accessToken),
          refreshToken: albyData.refreshToken ? await encryptForStorage(albyData.refreshToken) : null,
        })
        break
      }
    }

    return connection
  }

  // If a transaction is provided, use it; otherwise create a new one
  if (tx) {
    return await performCreate(tx)
  } else {
    return await db.transaction(performCreate)
  }
}
