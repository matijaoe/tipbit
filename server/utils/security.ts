import type { StrikeConnection } from './db'

// TODO: move to types
export type SanitizedStrikeConnection<T extends Partial<StrikeConnection>> = Omit<T, 'apiKey'> & {
  hasApiKey: boolean
}

export const sanitizeStrikeConnection = <T extends Partial<StrikeConnection>>(
  connection: T
): SanitizedStrikeConnection<T> => {
  const { apiKey, ...safeProps } = connection

  return {
    ...safeProps,
    hasApiKey: !!apiKey,
  }
}
