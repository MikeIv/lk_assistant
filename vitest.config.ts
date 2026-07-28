import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

const isCi = Boolean(process.env.CI)

export default defineConfig({
  test: {
    reporters: isCi ? ['default', 'junit'] : ['default'],
    ...(isCi
      ? {
          outputFile: {
            junit: './reports/junit.xml',
          },
        }
      : {}),
    coverage: {
      provider: 'v8',
      // html — локально; в CI достаточно text + cobertura (+ summary для baseline)
      reporter: isCi
        ? ['text', 'cobertura', 'json-summary']
        : ['text', 'html', 'cobertura', 'json-summary'],
      include: [
        'shared/utils/**/*.ts',
        'app/composables/**/*.ts',
        'app/middleware/**/*.ts',
        'server/utils/**/*.ts',
      ],
      exclude: ['**/*.d.ts'],
      // After domain composable nuxt suite (2026-07-28): ~75% overall; composables ~73–75%.
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 70,
        branches: 55,
      },
    },
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
