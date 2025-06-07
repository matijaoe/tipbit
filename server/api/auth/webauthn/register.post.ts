import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDB } from '../../../utils/db'
import { users, credentials, profiles } from '../../../database/schema'
import { randomUUID } from 'uncrypto'
import type { DatabaseTransaction } from '../../../database'

// Function to create a unique handle
async function createUniqueHandle(tx: DatabaseTransaction, baseHandle: string): Promise<string> {
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
    handle = `${baseHandle.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').split('@')[0]}${counter}`
    counter++
  }
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
    const session = await getUserSession(event)
    if (session.user?.email && session.user.email !== userBody.userName) {
      throw createError({ statusCode: 400, message: 'Email not matching current session' })
    }

    return z.object({
      userName: z.string().email().trim(),
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
        .where(eq(users.identifier, user.userName))

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
        // Check if user already exists with this email
        const existingUsers = await tx.select().from(users).where(eq(users.identifier, user.userName))
        dbUser = existingUsers[0]
        
        if (!dbUser) {
          // Create new user with passkey identifier type
          const userId = randomUUID()
          const [newUser] = await tx.insert(users).values({
            id: userId,
            identifierType: 'passkey',
            identifier: user.userName,
          }).returning()
          
          dbUser = newUser

          // Create a default profile for the new user
          const baseHandle = user.userName.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '') || 'user'
          const handle = await createUniqueHandle(tx, baseHandle)
          console.log('Creating profile with handle:', handle, 'for user:', dbUser.id)
          
          await tx.insert(profiles).values({
            userId: dbUser.id,
            displayName: user.displayName || `User ${baseHandle}`,
            handle,
            isPrimary: true,
            isPublic: true,
          })
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
          backedUp: credential.backedUp ? 1 : 0,
          transports: JSON.stringify(credential.transports ?? []),
        })
      })

      // Set proper session like OAuth handlers do
      await setUserSession(event, {
        user: {
          id: dbUser.id,
          identifier: dbUser.identifier,
          identifierType: dbUser.identifierType,
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