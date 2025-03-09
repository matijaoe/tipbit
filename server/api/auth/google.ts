import type { GoogleOAuthUser } from '~~/server/types/oauth'
import { handleOAuthLogin } from '~~/server/utils/auth'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }: { user: GoogleOAuthUser }) {
    try {
      return await handleOAuthLogin(event, {
        id: googleUser.sub,
        provider: 'google',
        identifier: googleUser.email,
        identifierType: 'email',
        displayName: googleUser.name,
        avatarUrl: googleUser.picture,
        handle: googleUser.email.split('@')[0],
      })
    } catch (error) {
      console.error('Google auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
