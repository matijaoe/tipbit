import { getInternalDB, schema } from '../database'

export { and, eq, or, sql } from 'drizzle-orm'

export const tables = schema

export const useDB = () => {
  return getInternalDB()
}

export type User = typeof tables.users.$inferSelect
export type UserInsert = typeof tables.users.$inferInsert

export type Profile = typeof tables.profiles.$inferSelect
export type ProfileInsert = typeof tables.profiles.$inferInsert

export type AuthConnection = typeof tables.authConnections.$inferSelect
export type AuthConnectionInsert = typeof tables.authConnections.$inferInsert

export type ProfilePaymentPreference = typeof tables.profilePaymentPreferences.$inferSelect
export type ProfilePaymentPreferenceInsert = typeof tables.profilePaymentPreferences.$inferInsert

export type StrikeConnection = typeof tables.strikeConnections.$inferSelect
export type StrikeConnectionInsert = typeof tables.strikeConnections.$inferInsert

export type PaymentConnection = typeof tables.paymentConnections.$inferSelect
export type PaymentConnectionInsert = typeof tables.paymentConnections.$inferInsert
