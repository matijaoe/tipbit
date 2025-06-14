import type { AuthConnection } from '~~/server/utils/db'

type UserWithConnections = User & { authConnections: AuthConnection[] }

export const useCurrentUser = () => {
  const { user: sessionUser } = useUserSession()

  const { data: user, clear: clearCurrentUser } = useFetch<UserWithConnections>('/api/me', {
    key: 'user',
    getCachedData: (key) => {
      const cachedUser = retrieveCached<UserWithConnections>(key)
      const matchesSessionUser = cachedUser?.id === sessionUser.value?.id
      return matchesSessionUser ? cachedUser : undefined
    },
  })

  const { data: cachedUser } = useNuxtData<UserWithConnections>('user')

  // No longer needed - user data is directly available

  return {
    user,
    cachedUser,
    clearCurrentUser,
  }
}
