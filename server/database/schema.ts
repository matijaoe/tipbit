import { randomUUID } from 'crypto'
import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// TODO: move to constants or type
const Roles = ['USER', 'ADMIN'] as const
export type Role = (typeof Roles)[number]

const AuthProviders = ['github', 'google', 'x', 'twitch'] as const
export type AuthProvider = (typeof AuthProviders)[number]

const IdentifierTypes = ['email', 'username'] as const
export type IdentifierType = (typeof IdentifierTypes)[number]

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

// OAuth connections
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

export const strikeConnections = sqliteTable('strike_connections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  handle: text('handle').notNull(),
  receiverId: text('receiver_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profiles: many(profiles),
  authConnections: many(authConnections),
  strikeConnection: one(strikeConnections),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

export const strikeConnectionsRelations = relations(strikeConnections, ({ one }) => ({
  user: one(users, {
    fields: [strikeConnections.userId],
    references: [users.id],
  }),
}))

export const authConnectionsRelations = relations(authConnections, ({ one }) => ({
  user: one(users, {
    fields: [authConnections.userId],
    references: [users.id],
  }),
}))
