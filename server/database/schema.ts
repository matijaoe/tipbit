import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'uncrypto'
import { AuthProviders, Roles } from '../../shared/constants/auth'
import { PaymentServiceTypes } from '../../shared/payments/constants'

// Core user entity - now contains profile data directly
// Should we still have separate profile table?
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  identifier: text('identifier').notNull().unique(), // email for social auth, username for passkey auth
  username: text('username').notNull().unique(), // public handle (@username), matches identifier for passkey auth
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  role: text('role', { enum: Roles }).default(Roles[0]).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const authConnections = sqliteTable(
  'auth_connections',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider', { enum: AuthProviders }).notNull(),
    providerUserId: text('provider_user_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex('provider_user_idx').on(table.provider, table.providerUserId)]
)

// Main payment connections table
export const paymentConnections = sqliteTable('payment_connections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  serviceType: text('service_type', { enum: PaymentServiceTypes }).notNull(),
  name: text('name'), // Optional friendly name for the connection
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const strikeConnections = sqliteTable('strike_connections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  connectionId: text('connection_id')
    .notNull()
    .unique()
    .references(() => paymentConnections.id, { onDelete: 'cascade' }),
  strikeProfileId: text('strike_profile_id').notNull(),
  handle: text('handle'), // Strike handle/username
  apiKey: text('api_key'), // Optional API key
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Example for Coinos (future implementation)
export const coinosConnections = sqliteTable('coinos_connections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  connectionId: text('connection_id')
    .notNull()
    .unique()
    .references(() => paymentConnections.id, { onDelete: 'cascade' }),
  coinosUsername: text('coinos_username').notNull(),
  apiKey: text('api_key').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Example for Alby (future implementation)
export const albyConnections = sqliteTable('alby_connections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  connectionId: text('connection_id')
    .notNull()
    .unique()
    .references(() => paymentConnections.id, { onDelete: 'cascade' }),
  albyId: text('alby_id').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// User-specific payment preferences (ordering) - simplified without profiles
export const userPaymentPreferences = sqliteTable(
  'user_payment_preferences',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    connectionId: text('connection_id')
      .notNull()
      .references(() => paymentConnections.id, { onDelete: 'cascade' }),
    priority: integer('priority').notNull(), // Lower number = higher priority
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex('user_connection_idx').on(table.userId, table.connectionId)]
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  authConnections: many(authConnections),
  paymentConnections: many(paymentConnections),
  credentials: many(credentials),
  paymentPreferences: many(userPaymentPreferences),
}))

// REMOVED: profilesRelations - no longer needed

// TODO: there are multiple XYZServiceConnection columns in drizzle studio
export const paymentConnectionsRelations = relations(paymentConnections, ({ one, many }) => ({
  user: one(users, {
    fields: [paymentConnections.userId],
    references: [users.id],
  }),
  strikeConnection: one(strikeConnections, {
    fields: [paymentConnections.id],
    references: [strikeConnections.connectionId],
  }),
  coinosConnection: one(coinosConnections, {
    fields: [paymentConnections.id],
    references: [coinosConnections.connectionId],
  }),
  albyConnection: one(albyConnections, {
    fields: [paymentConnections.id],
    references: [albyConnections.connectionId],
  }),
  userPreferences: many(userPaymentPreferences),
}))

export const strikeConnectionsRelations = relations(strikeConnections, ({ one }) => ({
  connection: one(paymentConnections, {
    fields: [strikeConnections.connectionId],
    references: [paymentConnections.id],
  }),
}))

export const coinosConnectionsRelations = relations(coinosConnections, ({ one }) => ({
  connection: one(paymentConnections, {
    fields: [coinosConnections.connectionId],
    references: [paymentConnections.id],
  }),
}))

export const albyConnectionsRelations = relations(albyConnections, ({ one }) => ({
  connection: one(paymentConnections, {
    fields: [albyConnections.connectionId],
    references: [paymentConnections.id],
  }),
}))

export const userPaymentPreferencesRelations = relations(userPaymentPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPaymentPreferences.userId],
    references: [users.id],
  }),
  connection: one(paymentConnections, {
    fields: [userPaymentPreferences.connectionId],
    references: [paymentConnections.id],
  }),
}))

// WebAuthn credentials table for passkey authentication
export const credentials = sqliteTable('credentials', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull(),
  backedUp: integer('backed_up', { mode: 'boolean' }).notNull(),
  transports: text('transports').notNull(), // JSON string array
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const authConnectionsRelations = relations(authConnections, ({ one }) => ({
  user: one(users, {
    fields: [authConnections.userId],
    references: [users.id],
  }),
}))

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
}))
