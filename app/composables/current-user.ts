import type { AuthConnection } from '~~/server/utils/db'

type UserWithProfiles = User & { profiles: Profile[]; authConnections: AuthConnection[] }

export const useCurrentUser = () => {
  const { user: sessionUser } = useUserSession()

  const { data: user, clear: clearCurrentUser } = useFetch<UserWithProfiles>('/api/me', {
    key: 'user',
    getCachedData: (key) => {
      const cachedUser = retrieveCached<UserWithProfiles>(key)
      const matchesSessionUser = cachedUser?.id === sessionUser.value?.id
      return matchesSessionUser ? cachedUser : undefined
    },
  })

  const { data: cachedUser } = useNuxtData<UserWithProfiles>('user')

  const primaryProfile = computed(() => {
    return user.value?.profiles?.find((p) => p.isPrimary) ?? user.value?.profiles?.[0]
  })

  return {
    user,
    cachedUser,
    clearCurrentUser,
    primaryProfile,
  }
}
