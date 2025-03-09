import { strikeConnections } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const { connectionId } = getRouterParams(event)

  const db = useDB()

  const deleted = await db
    .delete(strikeConnections)
    .where(and(eq(strikeConnections.id, connectionId), eq(strikeConnections.userId, user.id)))

  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: 'Connection not found or unauthorized',
    })
  }

  return deleted
})
