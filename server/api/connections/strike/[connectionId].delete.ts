import { and, eq } from 'drizzle-orm'
import { strikeConnections } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const { connectionId } = getRouterParams(event)

  const db = useDB()
  const deleted = await db
    .delete(strikeConnections)
    .where(and(eq(strikeConnections.id, connectionId), eq(strikeConnections.userId, user.id)))

  return deleted
})
