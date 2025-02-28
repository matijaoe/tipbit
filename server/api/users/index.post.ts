export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const [user] = await useDB().insert(tables.users).values(body).returning()

  const profile = await useDB().insert(tables.profiles).values({
    userId: user.id,
    displayName: user.username,
  })

  return {
    user,
    profile,
  }
})
