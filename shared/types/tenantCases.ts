export type TenantCaseApplicantStatus = 'переговоры' | 'отказ' | 'отказ с нашей стороны'

export type TenantCaseSortKey =
  | 'number'
  | 'floor'
  | 'room'
  | 'area_m2'
  | 'current_tenant'
  | 'tenant_applicant'
  | 'category'
  | 'status'
  | 'first_contact_date'
  | 'next_contact_date'
  | 'responsible'

export type TenantCaseSortDirection = 'asc' | 'desc'

export interface TenantCaseNegotiation {
  date: string | null
  info: string | null
}

export interface TenantCaseApplicant {
  id: number
  tenant_applicant_id: number
  tenant_applicant: string
  category: string
  status: TenantCaseApplicantStatus
  first_contact_date: string
  next_contact_date: string | null
  negotiations: TenantCaseNegotiation[]
  contacts: string
}

export interface TenantCaseRoom {
  id: string
  floor: string
  name: string
  area: number | null
}

export interface TenantCaseTableRow {
  number: number
  floor: string
  room: string
  area_m2: number | null
  current_tenant: string
  tenant_applicant: string
  category: string
  status: string
  first_contact_date: string | null
  next_contact_date: string | null
  negotiations_info: string
  contacts: string
  responsible: string | null
}

export interface TenantCase {
  id: number
  room_id: number
  room: TenantCaseRoom | null
  current_tenant: string
  responsible: string | null
  applicants: TenantCaseApplicant[]
  table_rows: TenantCaseTableRow[]
}

export interface TenantCaseTableDisplayRow extends TenantCaseTableRow {
  caseId: number
  rowSpan: number
}

export interface TenantCasesPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  rangeFrom: number
  rangeTo: number
}

export interface TenantCaseApiResource {
  id: number
  room_id: number
  room?: TenantCaseRoom | null
  current_tenant: string
  responsible: string | null
  applicants?: TenantCaseApplicant[]
  table_rows?: TenantCaseTableRow[]
}

export interface TenantCasesListApiResponse {
  success: boolean
  message: string
  payload: {
    data: TenantCaseApiResource[]
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface TenantCaseShowApiResponse {
  success: boolean
  message: string
  payload: TenantCaseApiResource
}

export interface TenantCaseApplicantPayload {
  tenant_applicant_id: number
  status: TenantCaseApplicantStatus
  first_contact_date: string
  next_contact_date: string | null
  negotiations: TenantCaseNegotiation[] | null
}

export interface TenantCaseCreatePayload {
  room_id: number
  responsible_name: string | null
  applicants: TenantCaseApplicantPayload[]
}

/** POST /v1/broker/tenant-cases — плоское тело создания (не applicants[]). */
export interface TenantCaseStorePayload {
  room_id: number
  responsible_name: string | null
  tenant_applicant_id: number
  first_contact_date: string
  negotiation_date: string
  negotiation_info: string
}

export interface TenantCaseMutationApiResponse {
  success: boolean
  message: string
  payload: TenantCaseApiResource
}

export interface TenantCaseCreateFieldErrors {
  room_id: string | null
  responsible_name: string | null
  tenant_applicant_id: string | null
  first_contact_date: string | null
  negotiation_date: string | null
  negotiation_info: string | null
  status: string | null
  applicants: string | null
}

export type TenantCaseMutationResult =
  | { ok: true }
  | { ok: false; fieldErrors: TenantCaseCreateFieldErrors; generalError: string | null }

export type TenantCaseDeleteResult = { ok: true } | { ok: false; generalError: string }
