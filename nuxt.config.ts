// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vueuse: {
    autoImports: true,
  },
  runtimeConfig: {
    public: {
      // TODO: move out of public when moved to own server api
      strikeApiKey: process.env.STRIKE_API_KEY,
      strikeApiUrl: process.env.STRIKE_API_URL,
    },
  },
})
