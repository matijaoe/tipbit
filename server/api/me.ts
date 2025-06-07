import { eq } from 'drizzle-orm'
import { users } from '../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const userWithProfiles = await useDB().query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      profiles: true,
      authConnections: true,
    },
  })

  return userWithProfiles
})
