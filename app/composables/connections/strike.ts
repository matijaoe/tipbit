import type { ResultSet } from '@libsql/client'
import type { StrikeAccountProfile } from '~~/lib/strike/api/types'
import type { StrikeConnectionRequestBody } from '~~/server/api/connections/strike/index.post'
import type { StrikeConnection } from '~~/server/utils/db'

type StrikeConnectionWithProfile = Omit<StrikeConnection, 'apiKey'> & {
  profile?: StrikeAccountProfile
  hasApiKey: boolean
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
      withProfile: true,
    },
    immediate: loggedIn.value,
  })

  const isConnected = computed(() => !!connection.value)
  const isConnectionLoading = computed(() => connectionStatus.value === 'pending')
  const connectionId = computed(() => connection.value?.id)

  const profile = toRef(() => connection.value?.profile)
  const profileHandle = toRef(() => profile.value?.handle)

  const connectAccount = async (body: StrikeConnectionRequestBody) => {
    try {
      const res = await $fetch('/api/connections/strike', {
        method: 'POST',
        body,
      })
      return res
    } catch (err) {
      console.error('Error connecting Strike account', err)
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
    refetchUserConnection,
    connectAccount,
    disconnectAccount,

    // Strike profile
    profile,
    profileHandle,
  }
}
