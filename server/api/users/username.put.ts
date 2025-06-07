import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../database/schema'

const updateUsernameSchema = z.object({
  newUsername: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
})

/**
 * API endpoint to update username
 * PUT /api/users/username
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody(event)
  const { newUsername } = updateUsernameSchema.parse(body)

  const db = useDB()

  // Check if username is already taken
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, newUsername),
  })

  if (existingUser && existingUser.id !== user.id) {
    throw createError({ 
      statusCode: 400, 
      message: 'Username already taken' 
    })
  }

  // Update username
  await db
    .update(users)
    .set({ 
      username: newUsername,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))

  // Update session with new username
  const updatedUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  })

  if (updatedUser) {
    await setUserSession(event, {
      user: {
        ...user,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
      },
      loggedInAt: new Date(),
    })
  }

  return { 
    success: true, 
    username: newUsername 
  }
})