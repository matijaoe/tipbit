import type { StrikeAccountProfile } from '~~/lib/strike/api/types'
import type { StrikeConnectionRequestBody } from '~~/server/api/connections/strike/index.post'
import type { PaymentConnection, StrikeConnection } from '~~/server/utils/db'

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

    try {
      const connId = connectionId.value
      if (!connId) {
        throw new Error('No connection ID found')
      }

      const deletedConnection = await $fetch(`/api/connections/strike/${connId}`, {
        method: 'DELETE',
      })

      console.log('🗑️ deletedConnection', deletedConnection)

      if (!deletedConnection) {
        console.warn('No connection was deleted')
      }

      // Clear the connection data regardless of API result
      clearUserConnection()
      return true
    } catch (error) {
      console.error('Error disconnecting Strike account:', error)

      // Still clear the connection from local state
      clearUserConnection()

      // Only re-throw if we want to show an error to the user
      // throw error
      return true
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
