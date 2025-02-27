export default defineNuxtRouteMiddleware(async (to) => {
  if (to.name === 'username') {
    const username = to.params.username as string

    const user = await $fetch(`/api/users/${username}`)
    console.log('👱🏻 [user] :', user)

    if (!user) {
      return createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    if (user.role === 'ADMIN') {
      navigateTo('/admin')
    }

    // // TODO: Should allow admin page, but not public page
    // if (!profile.isEnabled) {
    //   return createError({
    //     statusCode: 403,
    //     statusMessage: 'Public user page is disabled',
    //   })
    // }
  }
})
