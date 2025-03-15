export const useAuth = () => {
  const { clearCurrentUser } = useCurrentUser()
  const { clear: clearSession } = useUserSession()

  const logout = async () => {
    await clearSession()
    clearCurrentUser()
    clearNuxtData()
    navigateTo('/login')
    // TODO: Do I really need to call server?
    $fetch('/api/auth/logout')
  }

  return {
    logout,
  }
}
