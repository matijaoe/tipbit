/**
 * Strike API client
 */
import { strikeApiClient } from './client'
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

// Get or create the appropriate API client based on options
export const useStrikeApi = async (options?: StrikeApiOptions) => {
  if (options?.encryptedUserKey) {
    return await strikeApiClient.withUserKey(options.encryptedUserKey)
  }

  return strikeApiClient.global()
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
  console.log('🔑 createReceiveRequest with', options?.encryptedUserKey ? 'encrypted' : 'global', 'key')
  const api = await useStrikeApi(options)
  const receiveRequest = await api<StrikeReceiveRequest>('/receive-requests', {
    method: 'POST',
    body,
  })
  return receiveRequest
}
