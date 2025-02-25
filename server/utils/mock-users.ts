import { nanoid } from 'nanoid'

export const roles = ['user', 'super-admin']
export type Role = (typeof roles)[number]

export type MockUser = {
  id: string
  username: string
  displayName: string
  bio: string
  role: Role
  isEnabled: boolean
}
// This would be replaced with your actual database query
// Using the same mock database as in [username].ts
export const mockUserDatabase = [
  {
    id: nanoid(),
    username: 'super-admin',
    displayName: 'Super Admin',
    bio: 'I am Super Admin',
    role: 'super-admin',
    isEnabled: true,
  },
  { id: nanoid(), username: 'matija', displayName: 'Matija O', bio: 'Developer', role: 'admin', isEnabled: true },
  { id: nanoid(), username: 'marian', displayName: 'Marian B', bio: 'Devops', role: 'user', isEnabled: true },
  { id: nanoid(), username: 'demo', displayName: 'Demo User', bio: 'Just a demo', role: 'user', isEnabled: true },
  { id: nanoid(), username: 'patrik', displayName: 'Patrik B', bio: 'Disabled demo', role: 'user', isEnabled: false },
] satisfies MockUser[]
