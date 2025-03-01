export const useAuth = () => {
  const { clearCurrentUser } = useCurrentUser()
  const { clear: clearSession } = useUserSession()

  const logout = async () => {
    await clearSession()
    clearCurrentUser()
    navigateTo('/login')
  }

  return {
    logout,
  }
}
