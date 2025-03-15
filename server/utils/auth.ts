import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { db } from '~~/server/database'
import type { AuthProvider, IdentifierType } from '~~/server/database/schema'
import { authConnections, profiles, users } from '~~/server/database/schema'

type OAuthProvider = AuthProvider

// Infer the transaction type from the database
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export interface OAuthProviderData {
  id: string
  provider: OAuthProvider
  identifier: string
  identifierType: IdentifierType
  displayName: string
  avatarUrl?: string
  // profile handle
  handle?: string
}

// Function to find user by email
async function findUserByEmail(tx: Transaction, email: string) {
  return await tx.query.users.findFirst({
    where: (users) => eq(users.identifierType, 'email') && eq(users.identifier, email),
  })
}

// Function to find user by username
async function findUserByUsername(tx: Transaction, username: string) {
  return await tx.query.users.findFirst({
    where: (users) => eq(users.identifierType, 'username') && eq(users.identifier, username),
  })
}

export async function handleOAuthLogin(event: H3Event, providerData: OAuthProviderData) {
  providerData.identifier = providerData.identifier.toLowerCase()

  return await db.transaction(async (tx) => {
    // Check if account is already connected
    const connection = await tx.query.authConnections.findFirst({
      where: eq(authConnections.providerUserId, providerData.id),
      with: { user: true },
    })

    let userId

    if (connection) {
      // Existing user - update avatar if needed
      userId = connection.user.id
      if (providerData.avatarUrl) {
        await tx.update(users).set({ avatarUrl: providerData.avatarUrl }).where(eq(users.id, userId))
      }
    } else {
      // Check if user with this email already exists (for account linking)
      let existingUser = null
      if (providerData.identifierType === 'email') {
        existingUser = await findUserByEmail(tx, providerData.identifier)
      } else {
        existingUser = await findUserByUsername(tx, providerData.identifier)
      }

      if (existingUser) {
        // Link this provider to existing account
        userId = existingUser.id

        // Create auth connection
        await tx.insert(authConnections).values({
          userId,
          provider: providerData.provider,
          providerUserId: providerData.id,
        })

        // Update avatar if needed
        if (providerData.avatarUrl) {
          await tx.update(users).set({ avatarUrl: providerData.avatarUrl }).where(eq(users.id, userId))
        }
      } else {
        const { identifierType, identifier, avatarUrl } = providerData

        // New user - create account, profile and connection
        const [newUser] = await tx
          .insert(users)
          .values({
            identifierType,
            identifier,
            avatarUrl,
          })
          .returning()

        userId = newUser.id

        const handle = await createUniqueHandle(tx, providerData.handle || identifier)

        // Create profile
        await tx.insert(profiles).values({
          userId,
          displayName: providerData.displayName,
          handle,
          isPrimary: true,
          isPublic: true,
          avatarUrl: providerData.avatarUrl,
        })

        // Create auth connection
        await tx.insert(authConnections).values({
          userId,
          provider: providerData.provider,
          providerUserId: providerData.id,
        })
      }
    }

    // Get user data
    const user = await tx.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Set session
    await setUserSession(event, {
      user: {
        id: user.id,
        identifier: user.identifier,
        identifierType: user.identifierType,
        role: user.role,
        avatarUrl: user.avatarUrl ?? undefined,
      },
      loggedInAt: new Date(),
    })

    return sendRedirect(event, '/dashboard')
  })
}

// Function to create a unique handle
async function createUniqueHandle(tx: Transaction, baseHandle: string): Promise<string> {
  let handle = baseHandle
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '')
    .split('@')[0]
  let counter = 1

  // Keep checking until we find a unique handle
  while (true) {
    // Check if the handle exists using the transaction
    const existingProfile = await tx.query.profiles.findFirst({
      where: eq(profiles.handle, handle),
    })

    // If the handle doesn't exist, it's unique
    if (!existingProfile) {
      return handle
    }

    // Handle exists, add a number at the end and try again
    handle = `${baseHandle}${counter}`
    counter++
  }
}
