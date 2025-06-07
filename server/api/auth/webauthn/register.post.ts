import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDB } from '../../../utils/db'
import { users, credentials } from '../../../database/schema'
import { randomUUID } from 'uncrypto'
import type { DatabaseTransaction } from '../../../database'

// Function to create a unique username
async function createUniqueUsername(tx: DatabaseTransaction, baseUsername: string): Promise<string> {
  const cleanBase = baseUsername
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, '')
    .split('@')[0]

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

export default defineWebAuthnRegisterEventHandler({
  async getOptions(event, user) {
    // Configure for discoverable credentials (usernameless login)
    return {
      authenticatorSelection: {
        residentKey: 'required',
        requireResidentKey: true,
        userVerification: 'required',
      },
    }
  },
  async validateUser(userBody, event) {
    return z.object({
      userName: z.string().min(3).max(50).trim().regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      displayName: z.string().trim().optional(),
    }).parse(userBody)
  },
  async excludeCredentials(event, user) {
    const db = useDB()
    try {
      const result = await db
        .select({ id: credentials.id })
        .from(users)
        .innerJoin(credentials, eq(credentials.userId, users.id))
        .where(eq(users.username, user.userName))

      return result.filter(row => row.id).map(row => ({ id: row.id }))
    } catch (error) {
      // Return empty array if user doesn't exist yet
      return []
    }
  },
  async onSuccess(event, { credential, user }) {
    const db = useDB()
    try {
      let dbUser: any = null

      await db.transaction(async (tx) => {
        // Check if user already exists with this username
        const existingUsers = await tx.select().from(users).where(eq(users.username, user.userName))
        dbUser = existingUsers[0]
        
        if (!dbUser) {
          // Ensure username is unique
          const uniqueUsername = await createUniqueUsername(tx, user.userName)
          
          // Create new user with username as both identifier and username
          const userId = randomUUID()
          const [newUser] = await tx.insert(users).values({
            id: userId,
            identifier: uniqueUsername, // username serves as identifier for passkeys
            username: uniqueUsername,
            displayName: user.displayName || `${uniqueUsername}`,
            isPublic: false, // Private by default
          }).returning()
          
          dbUser = newUser
          console.log('Created new user with username:', uniqueUsername, 'for user:', dbUser.id)
        }

        if (!dbUser) {
          throw new Error('Failed to create user')
        }

        // Validate credential data
        if (!credential.id || !credential.publicKey || credential.counter === undefined) {
          throw new Error('Invalid credential data')
        }

        // Store the credential
        await tx.insert(credentials).values({
          id: credential.id,
          userId: dbUser.id,
          publicKey: credential.publicKey,
          counter: credential.counter,
          backedUp: credential.backedUp,
          transports: JSON.stringify(credential.transports ?? []),
        })
      })

      // Set proper session like OAuth handlers do
      await setUserSession(event, {
        user: {
          id: dbUser.id,
          username: dbUser.username,
          identifier: dbUser.identifier,
          displayName: dbUser.displayName,
          role: dbUser.role,
          avatarUrl: dbUser.avatarUrl ?? undefined,
        },
        loggedInAt: new Date(),
      })

      // Return success - frontend will handle redirect
      console.log('WebAuthn registration successful for user:', dbUser.id)
    }
    catch (err) {
      console.error('WebAuthn registration error:', err)
      throw createError({
        statusCode: 500,
        message: err instanceof Error && err.message.includes('UNIQUE constraint failed') 
          ? 'User already registered' 
          : `Failed to store credential: ${err instanceof Error ? err.message : 'Unknown error'}`,
      })
    }
  },
})
