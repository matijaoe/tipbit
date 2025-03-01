import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const generateUUID = () => crypto.randomUUID()

// TODO: move to constants
const Roles = ['USER', 'ADMIN'] as const
export type Role = (typeof Roles)[number]
const AuthProviders = ['github'] as const

// Core user entity
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(generateUUID),
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: Roles }).default(Roles[0]).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Multiple profiles per user
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().$defaultFn(generateUUID),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  handle: text('handle').notNull().unique(),
  displayName: text('display_name').notNull().unique(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// OAuth connections
export const authConnections = sqliteTable(
  'auth_connections',
  {
    id: text('id').primaryKey().$defaultFn(generateUUID),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  authConnections: many(authConnections),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

export const authConnectionsRelations = relations(authConnections, ({ one }) => ({
  user: one(users, {
    fields: [authConnections.userId],
    references: [users.id],
  }),
}))
