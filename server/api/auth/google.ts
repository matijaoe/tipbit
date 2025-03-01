import type { GoogleOAuthUser } from '~~/server/types/oauth'
import { handleOAuthLogin } from '~~/server/utils/auth'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }: { user: GoogleOAuthUser }) {
    try {
      const baseUsername = googleUser.email.split('@')[0].toLowerCase()

      return await handleOAuthLogin(event, {
        id: googleUser.sub,
        provider: 'google',
        email: googleUser.email,
        username: baseUsername,
        displayName: googleUser.name || baseUsername,
        avatarUrl: googleUser.picture,
      })
    } catch (error) {
      console.error('Google auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
})
