import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { authConnections, users } from '~~/server/database/schema'
import type { AuthProvider } from '~~/shared/constants/auth'
import type { DatabaseTransaction } from '../database'

type OAuthProvider = AuthProvider

export interface OAuthProviderData {
  id: string
  provider: OAuthProvider
  identifier: string
  displayName: string
  avatarUrl?: string
  username?: string
}

// Function to find user by identifier (email or username)
async function findUserByIdentifier(tx: DatabaseTransaction, identifier: string) {
  return await tx.query.users.findFirst({
    where: eq(users.identifier, identifier),
  })
}

export async function handleOAuthLogin(event: H3Event, providerData: OAuthProviderData) {
  providerData.identifier = providerData.identifier.toLowerCase()
  const db = useDB()
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
      // Check if user with this identifier already exists (for account linking)
      const existingUser = await findUserByIdentifier(tx, providerData.identifier)

      if (existingUser) {
        // Link this provider to existing account
        userId = existingUser.id

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
        const { identifier, avatarUrl } = providerData

        // Generate unique username from identifier
        const username = await createUniqueUsername(tx, providerData.username || identifier)

        // New user - create account and connection (no separate profile)
        const [newUser] = await tx
          .insert(users)
          .values({
            identifier,
            username,
            displayName: providerData.displayName,
            avatarUrl,
            isPublic: false, // Private by default
          })
          .returning()

        userId = newUser.id

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
        username: user.username,
        identifier: user.identifier,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl ?? undefined,
      },
      loggedInAt: new Date(),
    })

    return sendRedirect(event, '/dashboard')
  })
}

// Function to create a unique username with 4-digit random suffix if needed
async function createUniqueUsername(tx: DatabaseTransaction, identifier: string): Promise<string> {
  const cleanBase = identifier
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-zA-Z0-9_]/g, '')

  // First try the base username without any suffix
  const existingUser = await tx.query.users.findFirst({
    where: eq(users.username, cleanBase),
  })

  if (!existingUser) {
    return cleanBase
  }

  // If base username is taken, add 4-digit random number
  const maxAttempts = 10 // Prevent infinite loops
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000) // 4-digit number (1000-9999)
    const username = `${cleanBase}${randomSuffix}`

    const conflictingUser = await tx.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (!conflictingUser) {
      return username
    }
  }

  // Fallback: if somehow all random attempts fail, use timestamp
  return `${cleanBase}${Date.now().toString().slice(-4)}`
}
