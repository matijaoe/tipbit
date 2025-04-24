import type { PaymentServiceType } from '~~/shared/payments'

/**
 * Service information for connections
 */
export type ProviderService = {
  id: PaymentServiceType
  name: string
  description: string
  logo?: string
  url: string
}

/**
 * Connection status with provider-specific data
 */
export type ConnectionStatus = {
  isConnected: boolean
  isConfigured: boolean
  provider: PaymentServiceType
}
