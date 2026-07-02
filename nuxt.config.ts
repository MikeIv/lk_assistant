import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const isDev = process.env.NODE_ENV === 'development'
const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  /** Исходники приложения в `app/`. Каталог `server/` — в корне репозитория. */
  srcDir: 'app/',

  /** Фавиконки из `public/` — в статический HTML (при ssr: false useHead в app.vue не попадает в index.html). */
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64x64.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },

  /** Как в Booking_ukr: только клиентский рендер (проще локальные иконки / UIcon). */
  ssr: false,

  css: ['~/assets/styles/main.scss'],

  /** Как в Booking: `@nuxt/ui` раньше `@nuxt/icon` (Nuxt UI сам подключает Icon; порядок важен для согласованности). */
  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/eslint'],

  /**
   * Локальные SVG: префикс коллекции обязателен для SSR (см. Nuxt UI — Custom local collections).
   * `logo.svg` → `i-local-logo`; `logo-tablet.svg` / `logo-full.svg` → полный знак (Figma Logo).
   * Стрелки UI Kit (Figma Arrow/Icon): `app/assets/icons/arrows/*.svg` → `i-arrow-{name}`.
   */
  icon: {
    customCollections: [
      {
        prefix: 'local',
        dir: join(projectRoot, 'app', 'assets', 'icons'),
      },
      {
        prefix: 'arrow',
        dir: join(projectRoot, 'app', 'assets', 'icons', 'arrows'),
      },
    ],
  },

  ui: {
    colorMode: false,
    /** Без `@nuxt/fonts` — иначе запросы к api.fontsource.org и WARN при недоступности URL. Шрифты: `app.vue` + `assets/styles`. */
    fonts: false,
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  devtools: {
    /** В production-сборке DevTools не подключаем — меньше шум и размер. */
    enabled: isDev,
    timeline: { enabled: isDev },
  },

  typescript: {
    strict: true,
    /** Проверка типов на `nuxt build` / `nuxt generate`, без замедления каждого сохранения в dev */
    typeCheck: 'build',
  },

  /** Публичные ключи доступны на клиенте; секреты — только в корне `runtimeConfig` без `public` */
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
      /** Contract-id для API отчётов (временно, до auth/store). */
      contractId: process.env.NUXT_PUBLIC_CONTRACT_ID ?? '',
    },
  },

  features: {
    /** Логи Nuxt devtools в production не нужны */
    devLogs: isDev,
  },

  /** appManifest: убирает лишний запрос dev.json в dev */
  experimental: {
    appManifest: false,
  },

  vite: {
    build: {
      target: 'esnext',
      cssMinify: true,
    },
  },

  nitro: {
    /** Статическая SPA-сборка для nginx (document root → .output/public). */
    static: true,
    compressPublicAssets: true,
  },
})
