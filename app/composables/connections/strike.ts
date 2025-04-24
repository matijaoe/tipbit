import type { StrikeConnectionRequestBody } from '~~/server/api/connections/strike/index.post'
import type { PaymentConnection, StrikeConnection } from '~~/server/utils/db'
import type { StrikeAccountProfile } from '~~/shared/providers/strike/types'

type ConnectionWithStrikeConnectionAndProfile = PaymentConnection & {
  strikeConnection: Omit<StrikeConnection, 'apiKey'> & {
    hasApiKey: boolean
  }
  profile: StrikeAccountProfile
}

export const useStrikeConnection = () => {
  const { loggedIn } = useUserSession()

  const {
    data: connection,
    status: connectionStatus,
    refresh: refetchUserConnection,
    clear: clearUserConnection,
  } = useFetch<ConnectionWithStrikeConnectionAndProfile>('/api/connections/strike/me', {
    key: 'user:connection:strike',
    query: {
      withProfile: true,
    },
    immediate: loggedIn.value,
  })

  const isConnected = computed(() => !!connection.value)
  const isConnectionLoading = computed(() => connectionStatus.value === 'pending')
  const connectionId = toRef(() => connection.value?.id)

  const profile = toRef(() => connection.value?.profile)
  const profileHandle = toRef(() => profile.value?.handle)

  const connectAccount = (body: StrikeConnectionRequestBody) => {
    return $fetch('/api/connections/strike', {
      method: 'POST',
      body,
    })
  }

  const disconnectAccount = async () => {
    if (!isConnected.value) {
      return false
    }

    try {
      const connId = connectionId.value
      if (!connId) {
        throw new Error('No connection ID found')
      }

      const deletedConnection = await $fetch(`/api/connections/strike/${connId}`, {
        method: 'DELETE',
      })

      if (!deletedConnection) {
        console.warn('No connection was deleted')
      }
    } catch (error) {
      console.error('Error disconnecting Strike account:', error)
      throw error
    } finally {
      clearUserConnection()
    }
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
