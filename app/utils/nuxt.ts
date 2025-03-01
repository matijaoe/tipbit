export const retrieveCached = <T>(key: string): T | undefined => {
  const nuxtApp = useNuxtApp()
  const value = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
  if (!value) {
    return undefined
  }
  return value as T
}
