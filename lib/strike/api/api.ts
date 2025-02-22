import type {
  StrikeAccountProfile,
  StrikeCreateInvoiceRequest,
  StrikeCreateReceiveRequest,
  StrikeInvoice,
  StrikeQuote,
  StrikeReceiveRequest,
} from '~~/lib/strike/api/types'

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

export const createInvoice = async (body: StrikeCreateInvoiceRequest) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeInvoice>('/invoices', {
    method: 'POST',
    body,
  })
}

export const createInvoiceForHandle = async (handle: string, body: StrikeCreateInvoiceRequest) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeInvoice>(`/invoices/handle/${handle}`, {
    method: 'POST',
    body,
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

export const createReceiveRequest = async (body: StrikeCreateReceiveRequest) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeReceiveRequest>('/receive-requests', {
    method: 'POST',
    body,
  })
}

export const getReceiveRequest = async (receiveRequestId: string) => {
  const strikeApiFetch = useStrikeApi()
  return await strikeApiFetch<StrikeReceiveRequest>(`/receive-requests/${receiveRequestId}`, {
    method: 'GET',
  })
}
