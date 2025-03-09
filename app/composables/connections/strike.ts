import { fetchProfileByHandle } from '~~/lib/strike/api/api'
import type { StrikeAccountProfile } from '~~/lib/strike/api/types'
import type { StrikeConnection } from '~~/server/utils/db'

export const useStrikeConnection = () => {
  const { user: sessionUser } = useUserSession()

  // Try to figure out how to implement this
  // persist connection and fetched connection profile
  const localHandle = useCookie('strike_handle')
  const setLocalHandle = (handle: string) => {
    localHandle.value = handle
  }

  // Connection
  const connectionBody = computed(() => ({
    handle: localHandle.value,
  }))

  const {
    data: connection,
    refresh: refreshConnection,
    execute: _connectAccount,
    status: connectStatus,
  } = useFetch<StrikeConnection>('/api/connect/strike', {
    key: 'user:connection:strike',
    method: 'POST',
    immediate: false,
    watch: false,
    body: connectionBody,
    getCachedData: (key) => {
      const cachedConnection = retrieveCached<StrikeConnection>(key)
      const matchesSessionUser = cachedConnection?.id === sessionUser.value?.id
      return matchesSessionUser ? cachedConnection : undefined
    },
  })

  const isConnectionLoading = computed(() => connectStatus.value === 'pending')
  const isConnected = computed(() => !!connection.value)
  const connectionHandle = computed(() => connection.value?.handle)

  // Account
  const { data: account, status: accountStatus } = useAsyncData<StrikeAccountProfile | undefined>(
    'user:connection_profile:strike',
    async () => {
      if (!connectionHandle.value) return undefined
      return fetchProfileByHandle(connectionHandle.value)
    },
    {
      immediate: !!connection.value,
      watch: [connectionHandle],
    }
  )

  const isAccountLoading = computed(() => accountStatus.value === 'pending')

  const strikeAccountAddress = computed(() => (account.value ? `${account.value.handle}@strike.me` : ''))
  const strikeAccountTipUrl = computed(() => (account.value ? `https://strike.me/${account.value.handle}` : ''))

  // Connect account using the API
  const connectAccount = async (handle: string) => {
    if (!handle) {
      throw new Error('Strike handle is required')
    }

    try {
      setLocalHandle(handle)
      await _connectAccount()
    } catch (err) {
      console.error('[connectAccount]', err)
      setLocalHandle('')
      throw err
    }
  }

  const disconnectAccount = async () => {
    await $fetch(`/api/connect/${connection.value?.id}`, {
      method: 'DELETE',
    })

    // Refresh connection data
    await refreshConnection()
    setLocalHandle('')

    return true
  }

  return {
    // Data
    connection,
    account,

    // Computed
    isConnected,
    connectionHandle,
    isConnectionLoading,
    isAccountLoading,
    strikeAccountAddress,
    strikeAccountTipUrl,

    // Methods
    connectAccount,
    disconnectAccount,
    refresh: refreshConnection,
  }
}
