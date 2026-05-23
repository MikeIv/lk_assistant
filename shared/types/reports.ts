/** Ключи колонок таблицы отчётов (контракт API, как в LK-Shelk). */
export type ReportColumnKey =
  | 'id'
  | 'period'
  | 'turnover_amount'
  | 'turnover_fee'
  | 'status'
  | 'can_edit'
  | 'can_download_documents'
  | 'can_request_correction'
  | 'submitted_at'

export type ReportStatus = 'CorrectionRequested' | 'Submitted' | 'Draft' | 'Overdue' | 'Editable'

export interface ReportHeader {
  key: ReportColumnKey
  label: string
}

export interface ReportItem {
  id: number
  period: string
  turnover_amount: number
  turnover_fee: number
  status: ReportStatus
  can_edit: boolean
  can_download_documents: boolean
  can_request_correction: boolean
  submitted_at: string
}

export interface ReportsPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export interface ReportApiResponse {
  data: {
    header: ReportHeader[]
    body: ReportItem[]
  }
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type ReportPeriodSort = 'asc' | 'desc' | 'default'

export interface ReportPeriodRange {
  from: string
  to: string
}
