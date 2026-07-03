import type { CategoryApiResource } from '#shared/types/categories'

export type ApplicantSortKey = 'id' | 'title' | 'company_group' | 'category_id'

export type ApplicantSortDirection = 'asc' | 'desc'

export interface ApplicantContact {
  name: string | null
  position: string | null
  phone_number: string | null
  email: string | null
}

export interface ApplicantLegalEntity {
  id: number
  legal_entity: string
  inn: string
  kpp: string | null
}

export interface Applicant {
  id: number
  title: string
  company_group: string | null
  category_id: number
  category_name: string | null
  legal_entities: ApplicantLegalEntity[]
  contacts: ApplicantContact[]
}

export interface ApplicantsPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  rangeFrom: number
  rangeTo: number
}

export interface ApplicantApiResource {
  id: number
  company_group: string | null
  title: string
  category_id: number
  category?: CategoryApiResource | null
  legal_entities?: ApplicantLegalEntity[]
  contacts: ApplicantContact[]
}

export interface ApplicantsListApiResponse {
  success: boolean
  message: string
  payload: {
    data: ApplicantApiResource[]
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApplicantCreatePayload {
  title: string
  category_id: number
  company_group: string | null
  legal_entity_ids: number[] | null
  contacts: ApplicantContact[] | null
}

export interface ApplicantMutationApiResponse {
  success: boolean
  message: string
  payload: ApplicantApiResource
}

export interface ApplicantCreateFieldErrors {
  title: string | null
  category_id: string | null
  company_group: string | null
  legal_entity_ids: string | null
  contacts: string | null
}

export type ApplicantCreateResult =
  | { ok: true }
  | { ok: false; fieldErrors: ApplicantCreateFieldErrors; generalError: string | null }

export type ApplicantDeleteResult = { ok: true } | { ok: false; generalError: string }
