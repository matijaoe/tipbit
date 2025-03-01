import type { GitHubOAuthUser } from '~~/server/types/oauth'
import { handleOAuthLogin } from '~~/server/utils/auth'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: githubUser }: { user: GitHubOAuthUser }) {
    try {
      return await handleOAuthLogin(event, {
        id: githubUser.id.toString(),
        provider: 'github',
        username: githubUser.login.toLowerCase(),
        displayName: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
      })
    } catch (error) {
      console.error('GitHub auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
})
