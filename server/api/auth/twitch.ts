import type { TwitchOAuthUser } from '~~/server/types/oauth'
import { handleOAuthLogin } from '~~/server/utils/auth'

export default defineOAuthTwitchEventHandler({
  async onSuccess(event, { user: twitchUser }: { user: TwitchOAuthUser }) {
    try {
      return await handleOAuthLogin(event, {
        id: twitchUser.id,
        provider: 'twitch',
        identifier: twitchUser.email || `${twitchUser.login}@twitch`,
        username: twitchUser.login,
        displayName: twitchUser.display_name || twitchUser.login,
        avatarUrl: twitchUser.profile_image_url,
      })
    } catch (error) {
      console.error('Twitch auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
  onError(event, error) {
    console.error('Twitch OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
