import type { XOAuthUser } from '~~/server/types/oauth'
import { handleOAuthLogin } from '~~/server/utils/auth'

export default defineOAuthXEventHandler({
  async onSuccess(event, { user: xUser }: { user: XOAuthUser }) {
    try {
      return await handleOAuthLogin(event, {
        id: xUser.id,
        provider: 'x',
        // TODO: email should also be possible
        identifier: `x:${xUser.username}`,
        identifierType: 'username',
        displayName: xUser.name || xUser.username,
        avatarUrl: xUser.profile_image_url,
      })
    } catch (error) {
      console.error('X auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
})
