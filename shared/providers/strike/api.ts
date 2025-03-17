/**
 * Strike API client
 */
import type {
  StrikeAccountProfile,
  StrikeCreateReceiveRequest,
  StrikeInvoice,
  StrikeIssueInvoiceRequest,
  StrikeQuote,
  StrikeReceiveRequest,
} from './types'

// Define options type for API calls
export type StrikeApiOptions = {
  encryptedUserKey?: string
  // Can easily add more options here in the future
}

// Create a reusable factory for Strike API clients
export const createStrikeApiClient = {
  // Cached global client instance
  _globalClient: null as ReturnType<typeof $fetch.create> | null,

  // Create a base client with headers
  _createBaseClient(headers: Record<string, string>) {
    return $fetch.create({
      baseURL: process.env.NUXT_PUBLIC_STRIKE_API_URL || 'https://api.strike.me/v1',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    })
  },

  // Create Authorization header from API key
  _createAuthorizationHeader(apiKey: string) {
    return {
      Authorization: `Bearer ${apiKey}`,
    }
  },

  // Get or create a global client
  global() {
    if (!this._globalClient) {
      const config = useRuntimeConfig()

      if (!config.strikeApiKey) {
        throw createError({
          statusCode: 500,
          message: 'Strike API key not configured',
        })
      }

      this._globalClient = this._createBaseClient(this._createAuthorizationHeader(config.strikeApiKey))
    }

    return this._globalClient
  },

  // Create a client with a user-specific API key
  async withUserKey(encryptedUserKey: string) {
    if (!encryptedUserKey) {
      throw createError({
        statusCode: 400,
        message: 'Strike user API key is required',
      })
    }

    const apiKey = await decryptFromStorage(encryptedUserKey)
    return this._createBaseClient(this._createAuthorizationHeader(apiKey))
  },
}

// Get or create the appropriate API client based on options
export const useStrikeApi = async (options?: StrikeApiOptions) => {
  if (options?.encryptedUserKey) {
    return await createStrikeApiClient.withUserKey(options.encryptedUserKey)
  }

  return createStrikeApiClient.global()
}

// API functions

export const issueInvoice = async (body: StrikeIssueInvoiceRequest, options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const invoice = await api<StrikeInvoice>('/invoices', {
    method: 'POST',
    body,
  })
  return invoice
}

export const issueInvoiceForReceiver = async (
  handle: string,
  body: StrikeIssueInvoiceRequest,
  options?: StrikeApiOptions
) => {
  const api = await useStrikeApi(options)
  const invoice = await api<StrikeInvoice>(`/invoices/handle/${handle}`, {
    method: 'POST',
    body,
  })
  return invoice
}

export const createQuote = async (invoiceId: string, options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const quote = await api<StrikeQuote>(`/invoices/${invoiceId}/quote`, {
    method: 'POST',
  })
  return quote
}

export const getInvoices = async (options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const invoices = await api<StrikeInvoice[]>('/invoices')
  return invoices
}

export const getInvoice = async (invoiceId: string, options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const invoice = await api<StrikeInvoice>(`/invoices/${invoiceId}`)
  return invoice
}

export const cancelInvoice = async (invoiceId: string, options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const canceledInvoice = await api<StrikeInvoice>(`/invoices/${invoiceId}/cancel`, {
    method: 'PATCH',
  })
  return canceledInvoice
}

export const fetchProfileByHandle = async (handle: string, options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const profile = await api<StrikeAccountProfile>(`/accounts/handle/${handle}/profile`)
  return profile
}

export const fetchProfileById = async (id: string, options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const profile = await api<StrikeAccountProfile>(`/accounts/${id}/profile`)
  return profile
}

export const createReceiveRequest = async (body: StrikeCreateReceiveRequest, options?: StrikeApiOptions) => {
  const api = await useStrikeApi(options)
  const receiveRequest = await api<StrikeReceiveRequest>('/receive', {
    method: 'POST',
    body,
  })
  return receiveRequest
}
