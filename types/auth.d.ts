import type { Role } from './server/utils/mock-users'

// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    role: Role
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
