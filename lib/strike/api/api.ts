import type {
  StrikeAccountProfile,
  StrikeCreateReceiveRequest,
  StrikeInvoice,
  StrikeIssueInvoiceRequest,
  StrikeQuote,
  StrikeReceiveRequest,
} from '~~/lib/strike/api/types'
import { decryptFromStorage } from '~~/server/utils/encryption'

type ConnectionOpts = { type: 'global' } | { type: 'api_key'; encryptedApiKey: string }

/**
 * Creates a Strike API client with the specified connection type
 */
const createStrikeApi = async (opts: ConnectionOpts = { type: 'global' }) => {
  const config = useRuntimeConfig()

  // Default headers with global API key
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Set Authorization header based on connection type
  if (opts.type === 'global') {
    headers.Authorization = `Bearer ${config.public.strikeApiKey}`
  } else if (opts.type === 'api_key') {
    // Decrypt the API key using storage decryption
    const apiKey = await decryptFromStorage(opts.encryptedApiKey)
    headers.Authorization = `Bearer ${apiKey}`
  }

  return $fetch.create({
    baseURL: config.public.strikeApiUrl,
    timeout: 5000,
    headers,
  })
}

/**
 * Legacy method for compatibility - uses global API key
 */
const useStrikeApi = () => {
  const config = useRuntimeConfig()
  return $fetch.create({
    baseURL: config.public.strikeApiUrl,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${config.public.strikeApiKey}`,
      'Content-Type': 'application/json',
    },
  })
}

export const issueInvoice = async (body: StrikeIssueInvoiceRequest) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeInvoice>('/invoices', {
    method: 'POST',
    body,
  })
}

export const issueInvoiceForReceiver = async (handle: string, body: StrikeIssueInvoiceRequest) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeInvoice>(`/invoices/handle/${handle}`, {
    method: 'POST',
    body,
    headers: undefined,
  })
}

export const createQuote = async (invoiceId: string) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeQuote>(`/invoices/${invoiceId}/quote`, {
    method: 'POST',
  })
}

export const getInvoices = async () => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeInvoice[]>('/invoices', {
    method: 'GET',
  })
}

export const getInvoice = async (invoiceId: string) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeInvoice>(`/invoices/${invoiceId}`, {
    method: 'GET',
  })
}

export const cancelInvoice = async (invoiceId: string) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeInvoice>(`/invoices/${invoiceId}/cancel`, {
    method: 'PATCH',
  })
}

export const fetchProfileByHandle = async (handle: string) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeAccountProfile>(`/accounts/handle/${handle}/profile`, {
    method: 'GET',
  })
}

export const fetchProfileById = async (id: string) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeAccountProfile>(`/accounts/${id}/profile`, {
    method: 'GET',
  })
}

/**
 * Issues an invoice using a specific connection (either global or with user's API key)
 */
export const issueInvoiceWithConnection = async (
  handle: string,
  body: StrikeIssueInvoiceRequest,
  connection?: { type: 'handle' | 'api_key'; apiKey?: string }
) => {
  const strikeApiFetch =
    connection?.type === 'api_key' && connection.apiKey
      ? await createStrikeApi({ type: 'api_key', encryptedApiKey: connection.apiKey })
      : useStrikeApi()

  return await strikeApiFetch<StrikeInvoice>(`/invoices/handle/${handle}`, {
    method: 'POST',
    body,
    headers: undefined,
  })
}

/**
 * Fetches a profile using either the global API key or a user's encrypted API key
 */
export const fetchProfileWithConnection = async (
  idOrHandle: string,
  isHandle: boolean = false,
  connection?: { type: 'handle' | 'api_key'; apiKey?: string }
) => {
  const strikeApiFetch =
    connection?.type === 'api_key' && connection.apiKey
      ? await createStrikeApi({ type: 'api_key', encryptedApiKey: connection.apiKey })
      : useStrikeApi()

  const endpoint = isHandle ? `/accounts/handle/${idOrHandle}/profile` : `/accounts/${idOrHandle}/profile`

  return await strikeApiFetch<StrikeAccountProfile>(endpoint, {
    method: 'GET',
  })
}

// TODO: rework this so it doesn't ever use the global API key
export const createReceiveRequest = async (body: StrikeCreateReceiveRequest) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeReceiveRequest>('/receive-requests', {
    method: 'POST',
    body,
  })
}

/**
 * Creates a receive request using either the global API key or a user's encrypted API key
 */
// called only if user has api key defined for their connection
export const createReceiveRequestWithConnection = async (
  body: StrikeCreateReceiveRequest,
  connection?: { type: 'handle' | 'api_key'; apiKey?: string }
) => {
  const strikeApiFetch =
    connection?.type === 'api_key' && connection.apiKey
      ? await createStrikeApi({ type: 'api_key', encryptedApiKey: connection.apiKey })
      : useStrikeApi()

  return await strikeApiFetch<StrikeReceiveRequest>('/receive-requests', {
    method: 'POST',
    body,
  })
}
