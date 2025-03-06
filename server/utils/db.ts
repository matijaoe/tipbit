import { db, schema } from '../database'

export { sql, eq, and, or } from 'drizzle-orm'

export const tables = schema

export const useDB = () => {
  return db
}

export type User = typeof tables.users.$inferSelect
export type UserInsert = typeof tables.users.$inferInsert

export type Profile = typeof tables.profiles.$inferSelect
export type ProfileInsert = typeof tables.profiles.$inferInsert

export type StrikeConnection = typeof tables.strikeConnections.$inferSelect
export type StrikeConnectionInsert = typeof tables.strikeConnections.$inferInsert

export type AuthConnection = typeof tables.authConnections.$inferSelect
export type AuthConnectionInsert = typeof tables.authConnections.$inferInsert
