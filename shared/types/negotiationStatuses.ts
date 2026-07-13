export interface NegotiationStatus {
  id: number
  status: string
  name: string
  created_by_id: number | null
  responsible: string | null
  created_at: string
}

export interface NegotiationStatusApiResource {
  id: number
  status: string
  name: string
  created_by_id: number | null
  responsible?: string | null
  created_at: string
}

export interface NegotiationStatusesListApiResponse {
  success: boolean
  message: string
  payload: {
    items: NegotiationStatusApiResource[]
  }
}

export type NegotiationStatusSortKey = 'id' | 'name'

export type NegotiationStatusSortDirection = 'asc' | 'desc'

export interface NegotiationStatusesPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  rangeFrom: number
  rangeTo: number
}

export interface NegotiationStatusCreatePayload {
  name: string
}

export interface NegotiationStatusCreateApiResponse {
  success: boolean
  message: string
  payload: NegotiationStatusApiResource
}

export interface NegotiationStatusCreateFieldErrors {
  name: string | null
}

export type NegotiationStatusCreateResult =
  | { ok: true }
  | { ok: false; fieldErrors: NegotiationStatusCreateFieldErrors; generalError: string | null }

export type NegotiationStatusDeleteResult = { ok: true } | { ok: false; generalError: string }
