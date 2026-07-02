/**
 * Контракт бэкенда СК «Олимпийский» (ЛК брокера).
 * OpenAPI: https://olimpapi.portalrent.ru/docs/broker.json
 * Swagger UI: https://olimpapi.portalrent.ru/docs/broker#/
 */
export const API_DEFAULT_BASE = 'https://olimpapi.portalrent.ru/api' as const

export const API_DOCS_URL = 'https://olimpapi.portalrent.ru/docs/broker#/' as const

export const API_OPENAPI_URL = 'https://olimpapi.portalrent.ru/docs/broker.json' as const

/** Пути относительно {@link API_DEFAULT_BASE} (`/api` + сегмент). */
export const API_PATHS = {
  broker: {
    auth: {
      login: '/v1/broker/auth/login',
      refresh: '/v1/broker/auth/refresh',
      logout: '/v1/broker/auth/logout',
    },
    legalEntities: {
      list: '/v1/broker/legal-entities',
      detail: (id: number | string) => `/v1/broker/legal-entities/${id}`,
    },
    rooms: {
      list: '/v1/broker/dict/rooms',
      detail: (id: number | string) => `/v1/broker/dict/rooms/${id}`,
    },
    roomTypes: {
      list: '/v1/broker/dict/room-types',
      detail: (id: number | string) => `/v1/broker/dict/room-types/${id}`,
    },
    categories: {
      list: '/v1/broker/dict/categories',
      detail: (id: number | string) => `/v1/broker/dict/categories/${id}`,
    },
  },
  news: {
    list: '/v1/news',
    detail: (id: number | string) => `/v1/news/${id}`,
  },
  /** ЛК-аренда: эндпоинты вне текущего OpenAPI (LK-Shelk), до появления в спеке. */
  tenants: {
    reports: '/tenants/reports',
    reportPdf: (id: number | string) => `/tenants/reports/${id}/pdf`,
    reportDocuments: (id: number | string) => `/tenants/reports/${id}/documents`,
    reportRequestEdit: (id: number | string) => `/tenants/reports/${id}/request/edit`,
    data: '/tenants/data',
  },
} as const
