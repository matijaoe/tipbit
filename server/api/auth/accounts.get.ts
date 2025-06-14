export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user) {
    throw createError({ 
      statusCode: 401, 
      message: 'Not authenticated' 
    })
  }

  // For now, return single account (current user)
  // This will be expanded when multiple accounts per user are supported
  return [
    {
      id: session.user.id,
      username: session.user.username,
      identifier: session.user.identifier,
      displayName: session.user.displayName,
      avatarUrl: session.user.avatarUrl,
      isActive: true,
    }
  ]
})
