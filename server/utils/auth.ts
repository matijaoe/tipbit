import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import type { AuthProvider } from '~~/server/database/schema'
import { authConnections, profiles, users } from '~~/server/database/schema'
import type { H3Event } from 'h3'

type OAuthProvider = AuthProvider

// Infer the transaction type from the database
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export interface OAuthProviderData {
  id: string
  provider: OAuthProvider
  email?: string
  username: string
  displayName: string
  avatarUrl?: string
}

// TODO: think of universal approach to handle usernames... or get rid of the on account level

// Function to create a unique handle
async function createUniqueHandle(tx: Transaction, baseHandle: string): Promise<string> {
  let handle = baseHandle
  let counter = 1

  // Keep checking until we find a unique handle
  while (true) {
    // Check if the handle exists using the transaction
    const existingProfile = await tx.query.profiles.findFirst({
      where: eq(profiles.handle, handle),
    })
    console.log('🔍 existingProfile', existingProfile)

    // If the handle doesn't exist, it's unique
    if (!existingProfile) {
      return handle
    }

    // Handle exists, add a number at the end and try again
    handle = `${baseHandle}${counter}`
    console.log('🔍 handle', handle)
    counter++
  }
}

async function createUniqueUsername(tx: Transaction, baseUsername: string): Promise<string> {
  let username = baseUsername
  let counter = 1

  while (true) {
    const existingUser = await tx.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (!existingUser) {
      return username
    }

    username = `${baseUsername}${counter}`
    counter++
  }
}

export async function handleOAuthLogin(event: H3Event, providerData: OAuthProviderData) {
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
      const uniqueUsername = await createUniqueUsername(tx, providerData.username)

      // New user - create account, profile and connection
      const [newUser] = await tx
        .insert(users)
        .values({
          username: uniqueUsername,
          avatarUrl: providerData.avatarUrl,
        })
        .returning()

      userId = newUser.id

      // Create a unique handle
      const uniqueHandle = await createUniqueHandle(tx, providerData.username)

      // Create profile
      await tx.insert(profiles).values({
        userId,
        displayName: providerData.displayName,
        handle: uniqueHandle,
      })

      // Create auth connection
      await tx.insert(authConnections).values({
        userId,
        provider: providerData.provider,
        providerUserId: providerData.id,
      })
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
        role: user.role,
        avatarUrl: user.avatarUrl ?? undefined,
      },
      loggedInAt: new Date(),
    })

    return sendRedirect(event, '/dashboard')
  })
}
