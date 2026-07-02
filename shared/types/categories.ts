export type CategorySortKey = 'id' | 'name'

export type CategorySortDirection = 'asc' | 'desc'

export interface Category {
  id: number
  name: string
}

export interface CategoriesPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  /** Первая запись на текущей странице (1-based), 0 если пусто. */
  rangeFrom: number
  /** Последняя запись на текущей странице. */
  rangeTo: number
}

export interface CategoryApiResource {
  id: number
  name: string
}

export interface CategoriesListApiResponse {
  success: boolean
  message: string
  payload: {
    items: CategoryApiResource[]
  }
}

export interface CategoryCreatePayload {
  name: string
}

export interface CategoryCreateApiResponse {
  success: boolean
  message: string
  payload: CategoryApiResource
}

export interface CategoryCreateFieldErrors {
  name: string | null
}

export type CategoryCreateResult =
  | { ok: true }
  | { ok: false; fieldErrors: CategoryCreateFieldErrors; generalError: string | null }

export type CategoryDeleteResult = { ok: true } | { ok: false; generalError: string }
