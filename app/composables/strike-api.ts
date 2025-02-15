import type { CreateInvoiceRequest, CreateQuoteResponse, StrikeAccountProfile, StrikeInvoice } from '~~/types/strike'

export const useStrikeApi = () => {
  const config = useRuntimeConfig()

  const strikeApiFetch = $fetch.create({
    baseURL: 'https://api.strike.me/v1',
    headers: {
      Authorization: `Bearer ${config.public.strikeApiKey}`,
      'Content-Type': 'application/json',
    },
  })

  const issueInvoice = async (body: CreateInvoiceRequest) => {
    try {
      const invoice = await strikeApiFetch<StrikeInvoice>('/invoices', {
        method: 'POST',
        body,
      })
      return invoice
    } catch (err) {
      console.error(err)
    }
  }

  const issueQuoteForInvoice = async (invoiceId: string) => {
    try {
      const invoice = await strikeApiFetch<CreateQuoteResponse>(`/invoices/${invoiceId}/quote`, {
        method: 'POST',
      })
      return invoice
    } catch (err) {
      console.error(err)
    }
  }

  const cancelPendingInvoice = async (invoiceId: string) => {
    try {
      return await strikeApiFetch<StrikeInvoice>(`/invoices/${invoiceId}/cancel`, {
        method: 'PATCH',
      })
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPublicAccountProfileByHandle = async (handle: string) => {
    try {
      const account = await strikeApiFetch<StrikeAccountProfile>(`/accounts/handle/${handle}/profile`)
      return account
    } catch (err) {
      console.error(err)
    }
  }
  return {
    strikeApiFetch,
    issueInvoice,
    issueQuoteForInvoice,
    cancelPendingInvoice,
    fetchPublicAccountProfileByHandle,
  }
}
