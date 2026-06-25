/**
 * Контракт бэкенда СК «Олимпийский».
 * OpenAPI: https://olimpapi.portalrent.ru/docs/api.json
 * Swagger UI: https://olimpapi.portalrent.ru/docs/api#/
 */
export const API_DEFAULT_BASE = 'https://olimpapi.portalrent.ru/api' as const

export const API_DOCS_URL = 'https://olimpapi.portalrent.ru/docs/api#/' as const

export const API_OPENAPI_URL = 'https://olimpapi.portalrent.ru/docs/api.json' as const

/** Пути относительно {@link API_DEFAULT_BASE} (`/api` + сегмент). */
export const API_PATHS = {
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    forgot: '/v1/auth/forgot',
    refresh: '/v1/auth/refresh',
    logout: '/v1/auth/logout',
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
