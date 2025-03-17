/**
 * Payment provider integrations
 * Provides implementations for different payment services
 */
import { PaymentAdapterRegistry } from '../payments/adapters'
import { StrikeAdapter } from './strike'

/**
 * Create and register all payment adapters
 */
export const createPaymentAdapters = (): PaymentAdapterRegistry => {
  const registry = new PaymentAdapterRegistry()

  // Register the Strike adapter
  registry.register(new StrikeAdapter())

  // Register other adapters as they are implemented
  // registry.register(new CoinosAdapter())
  // registry.register(new AlbyAdapter())

  return registry
}

/**
 * Provider-specific exports
 * Each provider exports its own types and implementation
 */
export * from './strike'
// export * from './coinos'  // Uncomment when implemented
// export * from './alby'    // Uncomment when implemented

// Default export registry instance
export default createPaymentAdapters()
