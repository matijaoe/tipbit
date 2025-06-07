import { createError } from 'h3'
import { decryptFromStorage } from '~~/server/utils/encryption'

// Create a reusable factory for Strike API clients
// TODO: move to server, use non-public config
export const strikeApiClient = {
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
      // For server-side usage, we need to get the config differently
      // This will be handled in the server API endpoints
      const apiKey = process.env.NUXT_STRIKE_API_KEY
      
      if (!apiKey) {
        throw createError({
          statusCode: 500,
          message: 'Strike API key not configured',
        })
      }

      this._globalClient = this._createBaseClient(this._createAuthorizationHeader(apiKey))
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
