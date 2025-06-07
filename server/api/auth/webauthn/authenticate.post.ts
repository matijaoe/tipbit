import { eq } from 'drizzle-orm'
import { useDB } from '../../../utils/db'
import { users, credentials } from '../../../database/schema'

export default defineWebAuthnAuthenticateEventHandler({
  async getOptions(_event, _userName) {
    // Configure for usernameless authentication
    return {
      userVerification: 'required',
    }
  },
  async allowCredentials(event, userName) {
    // For usernameless authentication, return empty array to allow any credential
    if (!userName) {
      return []
    }

    // If username is provided, filter credentials (for backwards compatibility)
    const db = useDB()
    const result = await db
      .select({ id: credentials.id })
      .from(users)
      .leftJoin(credentials, eq(credentials.userId, users.id))
      .where(eq(users.username, userName))

    if (!result.length) {
      throw createError({ statusCode: 400, message: 'User not found ' })
    }

    return result.filter((row) => row.id).map((row) => ({ id: row.id! }))
  },
  async getCredential(_event, credentialId) {
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

    // Update the counter first
    await db
      .update(credentials)
      .set({ counter: authenticationInfo.newCounter })
      .where(eq(credentials.id, credential.id))

    // Get full user data for session using the credential ID
    const userResult = await db
      .select()
      .from(users)
      .innerJoin(credentials, eq(credentials.userId, users.id))
      .where(eq(credentials.id, credential.id))

    if (!userResult.length) {
      throw createError({ statusCode: 400, message: 'User not found for credential' })
    }

    const dbUser = userResult[0].users
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
    console.log('WebAuthn authentication successful for user:', dbUser.id, 'identifier:', dbUser.identifier)
  },
})
