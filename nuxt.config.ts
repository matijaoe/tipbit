// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    'motion-v/nuxt',
    ['nuxt-auth-utils', { webAuthn: true }],
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
    'shadcn-nuxt',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
    storage: 'cookie',
  },
  compatibilityDate: '2025-03-15',
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
  imports: {
    dirs: ['composables/**', 'stores/**', 'shared/utils/**'],
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
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
    webauthn: {
      register: {
        rpName: 'Tipbit',
        rpId: 'localhost',
        origin: 'http://localhost:3000',
      },
      authenticate: {
        rpId: 'localhost',
        origin: 'http://localhost:3000',
      },
    },
  },
})
