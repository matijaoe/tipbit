import type { PaymentConnection } from '~~/server/utils/db'
import type { PaymentServiceType } from '~~/shared/payments'
import type { ConnectionStatus } from '~~/shared/types/connections'

/**
 * Composable for managing all user payment connections
 */
export const useConnections = () => {
  const { loggedIn } = useUserSession()

  // Fetch all user connections
  const {
    data: connections,
    status: connectionsStatus,
    refresh: refreshConnections,
  } = useFetch<PaymentConnection[]>('/api/connections', {
    key: 'user:connections',
    immediate: loggedIn.value,
  })

  const isLoading = computed(() => connectionsStatus.value === 'pending')

  // Get connected services IDs
  const connectedServiceIds = computed<PaymentServiceType[]>(() => {
    if (!connections.value?.length) return []
    return connections.value.map((conn) => conn.serviceType as PaymentServiceType)
  })

  // Check if a specific service is connected
  const isServiceConnected = (serviceId: PaymentServiceType): boolean => {
    return connectedServiceIds.value.includes(serviceId)
  }

  // Get detailed status for a service
  const getServiceStatus = (serviceId: PaymentServiceType): ConnectionStatus => {
    const connection = connections.value?.find((conn) => conn.serviceType === serviceId)

    return {
      isConnected: !!connection,
      isConfigured: !!connection?.isEnabled,
      provider: serviceId,
    }
  }

  return {
    // Data
    connections,
    connectedServiceIds,

    // Status
    isLoading,

    // Actions
    refreshConnections,

    // Helpers
    isServiceConnected,
    getServiceStatus,
  }
}
