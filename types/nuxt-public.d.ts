declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    /**
     * Базовый URL HTTP API (без завершающего `/`).
     * Прод: `https://olimpapi.portalrent.ru/api` (см. OpenAPI servers).
     */
    apiBase: string
    /** Contract-id для запросов отчётов (до появления auth/store). */
    contractId: string
  }
}

export {}
