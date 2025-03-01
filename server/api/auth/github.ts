import { eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { authConnections, profiles, users } from '~~/server/database/schema'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: githubUser }) {
    console.log('🐙', githubUser)
    try {
      // Check if this GitHub account is already connected
      const connection = await db.query.authConnections.findFirst({
        where: eq(authConnections.providerUserId, githubUser.id.toString()),
        with: { user: true },
      })

      let userId

      if (connection) {
        // User already exists
        userId = connection.user.id

        // Update avatar URL if it has changed
        if (githubUser.avatar_url) {
          await db.update(users).set({ avatarUrl: githubUser.avatar_url }).where(eq(users.id, userId))
        }
      } else {
        // Create new user with avatar
        const [newUser] = await db
          .insert(users)
          .values({
            username: githubUser.login.toLowerCase(),
            avatarUrl: githubUser.avatar_url, // Store GitHub avatar URL
          })
          .returning()

        userId = newUser.id

        // Create profile
        await db.insert(profiles).values({
          userId: userId,
          displayName: githubUser.name || githubUser.login,
          handle: githubUser.login.toLowerCase(),
        })

        // Create auth connection
        await db.insert(authConnections).values({
          userId: userId,
          provider: 'github',
          providerUserId: githubUser.id.toString(),
        })
      }

      // Get user data
      const user = await db.query.users.findFirst({
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
    } catch (error) {
      console.error('GitHub auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
})
