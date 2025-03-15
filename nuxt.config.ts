// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    'motion-v/nuxt',
    'nuxt-auth-utils',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
    storage: 'cookie',
  },
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    typedPages: true,
  },
  devtools: { enabled: true },
  vueuse: {
    autoImports: true,
  },
  components: {
    dirs: [
      {
        path: '~/components/ui',
        enabled: true,
        prefix: '',
        extensions: ['.vue'],
      },
      '~/components',
    ],
  },
  pinia: {
    storesDirs: ['~/stores/**'],
  },
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
      },
      {
        name: 'Inter Mono',
        provider: 'google',
      },
    ],
  },
  runtimeConfig: {
    public: {
      transitPublicKey: process.env.NUXT_PUBLIC_TRANSIT_PUBLIC_KEY,
      // TODO: move out of public?
      strikeApiUrl: process.env.NUXT_PUBLIC_STRIKE_API_URL,
    },
    strikeApiKey: process.env.NUXT_STRIKE_API_KEY,
    dbFileName: process.env.DB_FILE_NAME,
    transitPrivateKey: process.env.NUXT_TRANSIT_PRIVATE_KEY,
    storageEncryptionKey: process.env.NUXT_STORAGE_ENCRYPTION_KEY,
  },
})
