// create user middleware

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('🔥 [user] :', to, from)

  if (to.name === 'username') {
    const username = to.params.username as string

    const exists = await $fetch(`/api/users/${username}`)
    if (!exists) {
      return createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }
  }
})
