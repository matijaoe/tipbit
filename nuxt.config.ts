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
      encryption: {
        publicKey: process.env.NUXT_ENCRYPTION_PUBLIC_KEY,
      },
      strikeApiKey: process.env.STRIKE_API_KEY,
      strikeApiUrl: process.env.STRIKE_API_URL,
    },
    dbFileName: process.env.DB_FILE_NAME,
    encryption: {
      privateKey: process.env.NUXT_ENCRYPTION_PRIVATE_KEY,
    },
    storageEncryptionKey: process.env.NUXT_STORAGE_ENCRYPTION_KEY,
  },
})
