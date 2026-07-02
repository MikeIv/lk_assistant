export type RoomTypeSortKey = 'id' | 'name'

export type RoomTypeSortDirection = 'asc' | 'desc'

export interface RoomType {
  id: number
  name: string
}

export interface RoomTypesPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  /** Первая запись на текущей странице (1-based), 0 если пусто. */
  rangeFrom: number
  /** Последняя запись на текущей странице. */
  rangeTo: number
}

export interface RoomTypeApiResource {
  id: number
  name: string
}

export interface RoomTypesListApiResponse {
  success: boolean
  message: string
  payload: {
    items: RoomTypeApiResource[]
  }
}

export interface RoomTypeCreatePayload {
  name: string
}

export interface RoomTypeCreateApiResponse {
  success: boolean
  message: string
  payload: RoomTypeApiResource
}

export interface RoomTypeCreateFieldErrors {
  name: string | null
}

export type RoomTypeCreateResult =
  | { ok: true }
  | { ok: false; fieldErrors: RoomTypeCreateFieldErrors; generalError: string | null }

export type RoomTypeDeleteResult = { ok: true } | { ok: false; generalError: string }
