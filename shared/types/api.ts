/**
 * Общие HTTP-типы. Контракт: OpenAPI https://olimpapi.portalrent.ru/docs/api.json
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type UnknownJson = Record<string, unknown>

/** Стандартная обёртка успешного ответа API. */
export interface ApiSuccessResponse<T> {
  success: boolean
  message: string
  payload: T
}

/** Пагинированный список внутри `payload`. */
export interface ApiPaginatedPayload<TItem> {
  items: TItem[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

export interface ApiErrorBody {
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}
