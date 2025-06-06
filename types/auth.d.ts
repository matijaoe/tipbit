import type { Role } from '~~/lib/general/constants'

// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    identifier: string
    identifierType: IdentifierType
    role: Role
    avatarUrl?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface UserSession {
    // Add your own fields
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SecureSessionData {
    // Add your own fields
  }
}

export {}
