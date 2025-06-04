import { randomUUID } from 'uncrypto'
import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { AuthProviders, IdentifierTypes, Roles } from '../../shared/constants/auth'
import { PaymentServiceTypes } from '../../shared/payments/constants'

// Core user entity
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  identifierType: text('identifier_type', { enum: IdentifierTypes }).notNull(),
  identifier: text('identifier').notNull().unique(),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: Roles }).default(Roles[0]).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Multiple profiles per user
export const profiles = sqliteTable('profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  handle: text('handle').notNull().unique(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'), // possible to override the default user avatar url
  // bio: text('bio'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  isPrimary: integer('is_default', { mode: 'boolean' }).default(false),
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

// Modified Strike connections table
export const strikeConnections = sqliteTable('strike_connections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  connectionId: text('connection_id')
    .notNull()
    .unique()
    .references(() => paymentConnections.id, { onDelete: 'cascade' }),
  strikeProfileId: text('strike_profile_id').notNull(),
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

// Profile-specific payment preferences (ordering)
export const profilePaymentPreferences = sqliteTable(
  'profile_payment_preferences',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    connectionId: text('connection_id')
      .notNull()
      .references(() => paymentConnections.id, { onDelete: 'cascade' }),
    priority: integer('priority').notNull(), // Lower number = higher priority
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex('profile_connection_idx').on(table.profileId, table.connectionId)]
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  authConnections: many(authConnections),
  paymentConnections: many(paymentConnections),
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  paymentPreferences: many(profilePaymentPreferences),
}))

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
  profilePreferences: many(profilePaymentPreferences),
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

export const profilePaymentPreferencesRelations = relations(profilePaymentPreferences, ({ one }) => ({
  profile: one(profiles, {
    fields: [profilePaymentPreferences.profileId],
    references: [profiles.id],
  }),
  connection: one(paymentConnections, {
    fields: [profilePaymentPreferences.connectionId],
    references: [paymentConnections.id],
  }),
}))

export const authConnectionsRelations = relations(authConnections, ({ one }) => ({
  user: one(users, {
    fields: [authConnections.userId],
    references: [users.id],
  }),
}))
