export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const satsToBtc = (sats: number) => Math.trunc(sats) / 100_000_000
