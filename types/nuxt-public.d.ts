declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    /** Базовый URL HTTP API (без завершающего `/`). Пример: `https://api.example.com` или `/api` для прокси. */
    apiBase: string
    /** Contract-id для запросов отчётов (до появления auth/store). */
    contractId: string
  }
}

export {}
