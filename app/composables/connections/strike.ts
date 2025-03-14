import type { ResultSet } from '@libsql/client'
import type { StrikeAccountProfile } from '~~/lib/strike/api/types'
import type { StrikeConnection } from '~~/server/utils/db'

type StrikeConnectionWithProfile = StrikeConnection & {
  profile?: StrikeAccountProfile
  type?: 'handle' | 'api_key'
}

export const useStrikeConnection = () => {
  const { loggedIn } = useUserSession()

  const {
    data: connection,
    status: connectionStatus,
    refresh: refetchUserConnection,
    clear: clearUserConnection,
  } = useFetch<StrikeConnectionWithProfile>('/api/connections/strike/me', {
    key: 'user:connection:strike',
    query: {
      profile: true,
    },
    immediate: loggedIn.value,
  })

  const isConnected = computed(() => !!connection.value)
  const isConnectionLoading = computed(() => connectionStatus.value === 'pending')
  const connectionId = computed(() => connection.value?.id)
  const connectionType = computed(() => connection.value?.type ?? 'handle')

  const profile = computed(() => connection.value?.profile)
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
          type: 'handle',
        },
      })
      await refetchUserConnection()
    } catch (err) {
      console.error('Error connecting Strike account', err)
      throw err
    }
  }

  const connectWithApiKey = async (apiKey: string) => {
    if (!apiKey) {
      throw new Error('Strike API key is required')
    }

    try {
      await $fetch('/api/connections/strike', {
        method: 'POST',
        body: {
          apiKey,
          type: 'api_key',
        },
      })
      await refetchUserConnection()
    } catch (err) {
      console.error('Error connecting Strike account with API key', err)
      throw err
    }
  }

  const disconnectAccount = async () => {
    if (!isConnected.value) {
      return
    }

    const res = await $fetch<ResultSet>(`/api/connections/strike/${connectionId.value}`, {
      method: 'DELETE',
    })

    if (!res.rowsAffected) {
      throw new Error('Failed to disconnect Strike account')
    }

    clearUserConnection()

    return true
  }

  return {
    // Current connection
    connection,
    isConnected,
    isConnectionLoading,
    connectionType,
    refetchUserConnection,
    connectAccount,
    connectWithApiKey,
    disconnectAccount,

    // Strike profile
    profile,
    profileHandle,
  }
}
