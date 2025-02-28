import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { authConnections, profiles, users } from '~~/server/database/schema'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: githubUser }) {
    // console.log('GitHub OAuth success, received user:', githubUser)
    try {
      // Check if this GitHub account is already connected
      // console.log('Checking if GitHub account exists:', githubUser.id)
      const connection = await db.query.authConnections.findFirst({
        where: eq(authConnections.providerUserId, githubUser.id.toString()),
        with: { user: true },
      })
      // console.log('Connection found:', connection)

      let userId

      if (connection) {
        // User already exists
        // console.log('Existing user found with connection')
        userId = connection.user.id
      } else {
        // Create new user
        // console.log('Creating new user with username:', githubUser.login)
        const [newUser] = await db
          .insert(users)
          .values({
            username: githubUser.login.toLowerCase(),
          })
          .returning()
        // console.log('New user created:', newUser)

        userId = newUser.id

        // Create profile
        // console.log('Creating profile for user')
        await db.insert(profiles).values({
          userId: userId,
          displayName: githubUser.name || githubUser.login,
        })
        // console.log('Profile created')

        // Create auth connection
        // console.log('Creating auth connection')
        await db.insert(authConnections).values({
          userId: userId,
          provider: 'github',
          providerUserId: githubUser.id.toString(),
        })
        // console.log('Auth connection created')
      }

      // Get user data
      // console.log('Fetching complete user data for ID:', userId)
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      })
      // console.log('User data retrieved:', user)

      if (!user) {
        // console.log('ERROR: User not found after creation/lookup')
        throw new Error('User not found')
      }

      // Set session
      // console.log('Setting user session')
      await setUserSession(event, {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        loggedInAt: new Date(),
      })
      // console.log('Session set successfully, redirecting to dashboard')

      return sendRedirect(event, '/dashboard')
    } catch (error) {
      // console.log('ERROR in GitHub auth flow:', error)
      console.error('GitHub auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
})
