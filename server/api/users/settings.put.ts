import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../database/schema'

const updateSettingsSchema = z.object({
  displayName: z.string().trim().max(100).optional(),
  isPublic: z.boolean().optional(),
})

/**
 * API endpoint to update user settings
 * PUT /api/users/settings
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody(event)
  const settings = updateSettingsSchema.parse(body)

  const db = useDB()

  // Update user settings
  await db
    .update(users)
    .set({ 
      ...settings,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))

  // Get updated user data
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
    user: updatedUser
  }
})