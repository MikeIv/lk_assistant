import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
          },
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          hookTimeout: 60_000,
          testTimeout: 30_000,
          fileParallelism: false,
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
              overrides: {
                runtimeConfig: {
                  public: {
                    apiBase: 'https://api.test',
                    contractId: '',
                  },
                },
              },
            },
          },
        },
      }),
    ],
  },
})
