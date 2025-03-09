import { fetchProfileByHandle } from '~~/lib/strike/api/api'
import type { StrikeAccountProfile } from '~~/lib/strike/api/types'
import type { StrikeConnection } from '~~/server/utils/db'

export const useStrikeConnection = () => {
  const { user: sessionUser, loggedIn } = useUserSession()

  const {
    data: connection,
    status: connectionStatus,
    refresh: refetchUserConnection,
    clear: clearUserConnection,
  } = useFetch<StrikeConnection>('/api/connections/strike/me', {
    key: 'user:connection:strike',
    immediate: loggedIn.value,
    getCachedData: (key) => {
      const cachedConnection = retrieveCached<StrikeConnection>(key)
      const matchesSessionUser = cachedConnection?.id === sessionUser.value?.id
      return matchesSessionUser ? cachedConnection : undefined
    },
  })

  const isConnected = computed(() => !!connection.value)
  const isConnectionLoading = computed(() => connectionStatus.value === 'pending')

  const connectionId = computed(() => connection.value?.id)
  const connectionHandle = computed(() => connection.value?.handle)

  // Strike profile
  const {
    data: profile,
    status: accountStatus,
    refresh: refetchProfile,
  } = useAsyncData<StrikeAccountProfile | undefined>(
    'user:connection_profile:strike',
    async () => {
      if (!connectionHandle.value) return undefined
      return fetchProfileByHandle(connectionHandle.value)
    },
    {
      server: true,
      lazy: false,
      immediate: isConnected.value,
      watch: [connectionHandle],
    }
  )

  const isProfileLoading = computed(() => accountStatus.value === 'pending')
  const profileHandle = computed(() => profile.value?.handle)

  const connectAccount = async (handle: string) => {
    if (!handle) {
      throw new Error('Strike handle is required')
    }

    try {
      await $fetch('/api/connections/strike', {
        method: 'POST',
        body: {
          handle,
        },
      })
      await refetchUserConnection()
      await refetchProfile()
    } catch (err) {
      console.error('[connectAccount]', err)
      throw err
    }
  }

  const disconnectAccount = async () => {
    if (!isConnected.value) {
      return
    }

    const deleted = await $fetch(`/api/connections/strike/${connectionId.value}`, {
      method: 'DELETE',
    })

    if (!deleted) {
      throw new Error('Failed to disconnect account')
    }

    clearUserConnection()

    return true
  }

  return {
    // Current connection
    connection,
    isConnected,
    connectionHandle,
    isConnectionLoading,
    refetchUserConnection,
    connectAccount,
    disconnectAccount,

    // Strike profile
    profile,
    isProfileLoading,
    profileHandle,
  }
}
