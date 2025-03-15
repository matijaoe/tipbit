import type {
  StrikeAccountProfile,
  StrikeCreateReceiveRequest,
  StrikeInvoice,
  StrikeIssueInvoiceRequest,
  StrikeQuote,
  StrikeReceiveRequest,
} from '~~/lib/strike/api/types'
import { decryptFromStorage } from '~~/server/utils/encryption'

// Define options type for API calls
export type StrikeApiOptions = {
  encryptedUserKey?: string
  // Can easily add more options here in the future
}

// Create a reusable factory for Strike API clients
export const createStrikeApiClient = {
  // Cached global client instance
  _globalClient: null as ReturnType<typeof $fetch.create> | null,

  // Create base client with shared configuration
  _createBaseClient(headers: Record<string, string>) {
    const config = useRuntimeConfig()
    return $fetch.create({
      baseURL: config.public.strikeApiUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })
  },

  _createAuthorizationHeader(apiKey: string) {
    return `Bearer ${apiKey}`
  },

  // Get or create global client
  global() {
    if (this._globalClient) {
      return this._globalClient
    }

    const config = useRuntimeConfig()
    this._globalClient = this._createBaseClient({
      Authorization: this._createAuthorizationHeader(config.strikeApiKey),
    })

    return this._globalClient
  },

  // Create user-specific client
  async withUserKey(encryptedUserKey: string) {
    const apiKey = await decryptFromStorage(encryptedUserKey)
    return this._createBaseClient({
      Authorization: this._createAuthorizationHeader(apiKey),
    })
  },
}

/**
 * Composable that provides a Strike API client
 * @param options Optional API configuration
 * @returns Configured fetch instance for Strike API
 */
export const useStrikeApi = async (options?: StrikeApiOptions) => {
  const { encryptedUserKey } = options ?? {}
  if (encryptedUserKey) {
    console.log('🔑 [Using user api key]', encryptedUserKey)
    return await createStrikeApiClient.withUserKey(encryptedUserKey)
  }
  console.log('🌍 [Using global api key]')
  return createStrikeApiClient.global()
}

export const issueInvoice = async (body: StrikeIssueInvoiceRequest, options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeInvoice>('/invoices', {
    method: 'POST',
    body,
  })
}

export const issueInvoiceForReceiver = async (
  handle: string,
  body: StrikeIssueInvoiceRequest,
  options?: StrikeApiOptions
) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeInvoice>(`/invoices/handle/${handle}`, {
    method: 'POST',
    body,
    headers: undefined,
  })
}

export const createQuote = async (invoiceId: string, options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeQuote>(`/invoices/${invoiceId}/quote`, {
    method: 'POST',
  })
}

export const getInvoices = async (options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeInvoice[]>('/invoices', {
    method: 'GET',
  })
}

export const getInvoice = async (invoiceId: string, options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeInvoice>(`/invoices/${invoiceId}`, {
    method: 'GET',
  })
}

export const cancelInvoice = async (invoiceId: string, options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeInvoice>(`/invoices/${invoiceId}/cancel`, {
    method: 'PATCH',
  })
}

export const fetchProfileByHandle = async (handle: string, options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeAccountProfile>(`/accounts/handle/${handle}/profile`, {
    method: 'GET',
  })
}

export const fetchProfileById = async (id: string, options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeAccountProfile>(`/accounts/${id}/profile`, {
    method: 'GET',
  })
}

export const createReceiveRequest = async (body: StrikeCreateReceiveRequest, options?: StrikeApiOptions) => {
  const strikeApi = await useStrikeApi(options)
  return await strikeApi<StrikeReceiveRequest>('/receive-requests', {
    method: 'POST',
    body,
  })
}
