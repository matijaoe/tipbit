import { eq } from 'drizzle-orm'
import { useDB } from '../../../utils/db'
import { users, credentials } from '../../../database/schema'

export default defineWebAuthnAuthenticateEventHandler({
  async allowCredentials(event, userName) {
    const db = useDB()
    const result = await db
      .select({ id: credentials.id })
      .from(users)
      .leftJoin(credentials, eq(credentials.userId, users.id))
      .where(eq(users.identifier, userName))

    if (!result.length) {
      throw createError({ statusCode: 400, message: 'User not found' })
    }

    return result.filter((row) => row.id).map((row) => ({ id: row.id! }))
  },
  async getCredential(event, credentialId) {
    const db = useDB()
    const result = await db.select().from(credentials).where(eq(credentials.id, credentialId))

    if (!result.length) {
      throw createError({ statusCode: 400, message: 'Credential not found' })
    }

    const credential = result[0]
    return {
      ...credential,
      backedUp: Boolean(credential.backedUp),
      transports: JSON.parse(credential.transports),
    }
  },
  async onSuccess(event, { credential, authenticationInfo }) {
    const db = useDB()

    // Get user email
    const result = await db
      .select({ identifier: users.identifier })
      .from(credentials)
      .innerJoin(users, eq(users.id, credentials.userId))
      .where(eq(credentials.id, credential.id))

    if (!result.length) {
      throw createError({ statusCode: 400, message: 'User not found' })
    }

    // Update the counter
    await db
      .update(credentials)
      .set({ counter: authenticationInfo.newCounter })
      .where(eq(credentials.id, credential.id))

    // Get full user data for session
    const userResult = await db
      .select()
      .from(users)
      .innerJoin(credentials, eq(credentials.userId, users.id))
      .where(eq(credentials.id, credential.id))

    if (!userResult.length) {
      throw createError({ statusCode: 400, message: 'User not found' })
    }

    const dbUser = userResult[0].users
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
    console.log('WebAuthn authentication successful for user:', dbUser.id)
  },
})
