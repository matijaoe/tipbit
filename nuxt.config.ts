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
  runtimeConfig: {
    public: {
      // TODO: move out of public when moved to own server api
      strikeApiKey: process.env.STRIKE_API_KEY,
      strikeApiUrl: process.env.STRIKE_API_URL,
    },
  },
})
