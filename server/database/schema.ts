import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// TODO: move to constants
const Roles = ['USER', 'ADMIN'] as const

const generateId = () => crypto.randomUUID()

// Core user entity
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(generateId),
  username: text('username').notNull().unique(),
  role: text('role', { enum: Roles }).default(Roles[0]),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Multiple profiles per user
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().$defaultFn(generateId),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull().unique(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))
