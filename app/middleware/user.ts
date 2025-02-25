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

    if (exists.role === 'super-admin') {
      navigateTo('/super-admin')
    }

    // TODO: Should allow admin page, but not public page
    if (!exists.isEnabled) {
      return createError({
        statusCode: 403,
        statusMessage: 'Public user page is disabled',
      })
    }
  }
})
