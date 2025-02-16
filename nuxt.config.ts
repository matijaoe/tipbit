// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
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
  typescript: {
    tsConfig: {
      compilerOptions: {
        baseUrl: '.',
      },
    },
  },
  components: [
    {
      // dirty fix for duplicate imports for radix-vue
      path: '~/components',
      extensions: ['.vue'],
    },
  ],
  runtimeConfig: {
    public: {
      // TODO: move out of public when moved to own server api
      strikeApiKey: process.env.STRIKE_API_KEY,
      strikeApiUrl: process.env.STRIKE_API_URL,
    },
  },
})
