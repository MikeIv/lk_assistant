import type { ReportColumnKey, ReportHeader, ReportItem, ReportStatus } from '#shared/types/reports'

const REPORT_COLUMN_KEYS = new Set<ReportColumnKey>([
  'id',
  'period',
  'turnover_amount',
  'turnover_fee',
  'status',
  'can_edit',
  'can_download_documents',
  'can_request_correction',
  'submitted_at',
])

const REPORT_STATUSES = new Set<ReportStatus>([
  'CorrectionRequested',
  'Submitted',
  'Draft',
  'Overdue',
  'Editable',
])

export function isReportColumnKey(value: string): value is ReportColumnKey {
  return REPORT_COLUMN_KEYS.has(value as ReportColumnKey)
}

export function normalizeReportHeaders(headers: ReportHeader[]): ReportHeader[] {
  return headers.filter((header): header is ReportHeader => isReportColumnKey(header.key))
}

export function normalizeReportStatus(value: string): ReportStatus {
  if (REPORT_STATUSES.has(value as ReportStatus)) {
    return value as ReportStatus
  }

  return 'Submitted'
}

export function normalizeReportItem(item: ReportItem): ReportItem {
  return {
    ...item,
    status: normalizeReportStatus(item.status),
  }
}
