import { z } from 'zod'

const switchAccountSchema = z.object({
  accountId: z.string(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { accountId } = switchAccountSchema.parse(body)
  
  const session = await getUserSession(event)
  
  if (!session?.user) {
    throw createError({ 
      statusCode: 401, 
      message: 'Not authenticated' 
    })
  }

  // For now, since we're implementing single-user model, 
  // account switching will be a future enhancement
  // This endpoint is prepared for when multiple accounts per user are supported
  
  if (accountId !== session.user.id) {
    throw createError({ 
      statusCode: 400, 
      message: 'Account not found' 
    })
  }

  // Account is already active (single account model)
  return { success: true, activeAccount: session.user }
})