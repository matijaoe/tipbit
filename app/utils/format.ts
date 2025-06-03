/**
 * Format an amount to a human-readable format
 */
export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Convert satoshis to BTC
 */
export const satsToBtc = (sats: number) => Math.trunc(sats) / 100_000_000

/**
 * Convert BTC to satoshis
 */
export const btcToSats = (btc: number): number => {
  return Math.trunc(btc * 100_000_000)
}
