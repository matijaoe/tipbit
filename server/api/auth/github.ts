import { handleOAuthLogin } from '~~/server/utils/auth'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: githubUser }) {
    try {
      return await handleOAuthLogin(event, {
        id: githubUser.id.toString(),
        provider: 'github',
        identifier: githubUser.email || `${githubUser.login}@github`,
        username: githubUser.login,
        displayName: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
      })
    } catch (error) {
      console.error('GitHub auth error:', error)
      return sendRedirect(event, '/login?error=auth_failed')
    }
  },
  onError(event, error) {
    console.error('GitHub auth error:', error)
    return sendRedirect(event, '/login?error=auth_failed')
  },
})
