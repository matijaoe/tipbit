import type { PaymentConnection } from '~~/server/utils/db'

export const useConnections = () => {
  const { loggedIn } = useUserSession()

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
  const connectedServiceIds = computed(() => {
    if (!connections.value?.length) return []
    return connections.value.map((conn) => conn.serviceType)
  })

  // Check if a specific service is connected
  const isServiceConnected = (serviceId: ProviderType) => {
    return connectedServiceIds.value.includes(serviceId)
  }

  return {
    connections,
    isLoading,
    refreshConnections,
    connectedServiceIds,
    isServiceConnected,
  }
}
