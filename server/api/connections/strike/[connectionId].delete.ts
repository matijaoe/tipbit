import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, getValidatedRouterParams } from 'h3'
import { z } from 'zod'
import { paymentConnections } from '~~/server/database/schema'

const paramsSchema = z.object({
  connectionId: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { connectionId } = await getValidatedRouterParams(event, paramsSchema.parse)

  const db = useDB()

  // This will throw a 404 if not found
  const connection = await db.query.paymentConnections.findFirst({
    where: (pc) => and(eq(pc.id, connectionId), eq(pc.userId, user.id), eq(pc.serviceType, 'strike')),
  })

  if (!connection) {
    throw createError({
      statusCode: 404,
      message: 'Connection not found or not authorized to delete',
    })
  }

  const deletedConnection = await db
    .delete(paymentConnections)
    .where(eq(paymentConnections.id, connectionId))
    .returning()
    .then((res) => res[0])

  return deletedConnection
})
