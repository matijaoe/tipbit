type UserWithProfiles = User & { profiles: Profile[] }

export const useCurrentUser = () => {
  const { user: sessionUser } = useUserSession()

  const { data: user, clear: clearCurrentUser } = useFetch<UserWithProfiles>('/api/me', {
    key: 'user',
    server: false,
    getCachedData: (key) => {
      const cachedUser = retrieveCached<UserWithProfiles>(key)
      const matchesSessionUser = cachedUser?.id === sessionUser.value?.id
      if (matchesSessionUser) {
        return cachedUser
      }
      // fetch new user data
      return undefined
    },
  })

  const { data: cachedUser } = useNuxtData<UserWithProfiles>('user')

  return {
    user,
    cachedUser,
    clearCurrentUser,
  }
}
