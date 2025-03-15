import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        // If your tests are in a different directory than your Nuxt app
        dotenv: {
          fileName: '.env.test',
        },
        overrides: {},
      },
    },
  },
})
