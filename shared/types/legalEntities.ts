export type LegalEntitySortKey = 'id' | 'legal_entity' | 'inn' | 'kpp'

export type LegalEntitySortDirection = 'asc' | 'desc'

export interface LegalEntity {
  id: number
  legal_entity: string
  inn: string
  kpp: string | null
}

export interface LegalEntitiesPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  /** Первая запись на текущей странице (1-based), 0 если пусто. */
  rangeFrom: number
  /** Последняя запись на текущей странице. */
  rangeTo: number
}

export interface LegalEntityApiResource {
  id: number
  legal_entity: string
  inn: string
  kpp: string | null
}

export interface LegalEntitiesListApiResponse {
  success: boolean
  message: string
  payload: {
    data: LegalEntityApiResource[]
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface LegalEntityCreatePayload {
  legal_entity: string
  inn: string
  kpp: string | null
}

export interface LegalEntityCreateApiResponse {
  success: boolean
  message: string
  payload: LegalEntityApiResource
}

export interface LegalEntityCreateFieldErrors {
  legal_entity: string | null
  inn: string | null
  kpp: string | null
}

export type LegalEntityCreateResult =
  | { ok: true }
  | { ok: false; fieldErrors: LegalEntityCreateFieldErrors; generalError: string | null }
