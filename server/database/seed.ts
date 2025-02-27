import { createClient } from '@libsql/client'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import type { ProfileInsert, UserInsert } from '../utils/db'
import { profiles, users } from './schema'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({ url: process.env.DB_FILE_NAME! })
const db = drizzle(client)

async function main() {
  const usersData: UserInsert[] = [
    {
      username: 'matijao',
      role: 'ADMIN',
    },
    {
      username: 'marian',
      role: 'USER',
    },
    {
      username: 'tomo',
      role: 'USER',
    },
  ]

  // Insert multiple users at once
  const insertedUsers = await db.insert(users).values(usersData).returning()

  // Create profiles for all users
  const profilesData: ProfileInsert[] = insertedUsers.map((user) => ({
    userId: user.id,
    displayName: user.username,
    isPublic: true,
  }))

  await db.insert(profiles).values(profilesData)

  // Query users with their profiles
  const allUsers = await db.select().from(users)
  console.log('All users:', allUsers)

  // Get users with their profiles
  const usersWithProfiles = await db.select().from(users).leftJoin(profiles, eq(users.id, profiles.userId))
  console.log('Users with profiles:', usersWithProfiles)
}

main()
