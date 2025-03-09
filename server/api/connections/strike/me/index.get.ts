import { strikeConnections } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const db = useDB()

  const connection = await db.query.strikeConnections.findFirst({
    where: eq(strikeConnections.userId, user.id),
  })

  return connection
})
