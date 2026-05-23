import type { ReportHeader, ReportItem, ReportStatus } from '#shared/types/reports'

/** Заголовки колонок — как от API `/tenants/reports`. */
export const REPORTS_MOCK_HEADERS: ReportHeader[] = [
  { key: 'id', label: '№' },
  { key: 'period', label: 'Отчётный период' },
  { key: 'turnover_amount', label: 'Оборот, ₽' },
  { key: 'turnover_fee', label: 'Вознаграждение, ₽' },
  { key: 'status', label: 'Статус' },
  { key: 'can_edit', label: 'Редактирование' },
  { key: 'can_download_documents', label: 'Скачивание' },
  { key: 'can_request_correction', label: 'Исправление' },
  { key: 'submitted_at', label: 'Дата отправки' },
]

const STATUSES: ReportStatus[] = [
  'Submitted',
  'Draft',
  'Draft',
  'Overdue',
  'Editable',
  'CorrectionRequested',
  'Submitted',
  'Draft',
]

function padMonth(month: number): string {
  return String(month).padStart(2, '0')
}

function buildPeriod(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${padMonth(month)}-01 - ${year}-${padMonth(month)}-${String(lastDay).padStart(2, '0')}`
}

function buildSubmittedAt(year: number, month: number, day: number): string {
  return `${year}-${padMonth(month)}-${String(day).padStart(2, '0')}T10:00:00.000000Z`
}

/** Полный набор мок-строк для локальной пагинации и фильтров (п.2). */
export const REPORTS_MOCK_ITEMS: ReportItem[] = Array.from({ length: 48 }, (_, index) => {
  const id = index + 1
  const monthOffset = index % 12
  const year = 2024 + Math.floor(index / 12)
  const month = monthOffset + 1
  const status = STATUSES[index % STATUSES.length] ?? 'Submitted'
  const isDraft = status === 'Draft'
  const isOverdue = status === 'Overdue'

  return {
    id,
    period: buildPeriod(year, month),
    turnover_amount: 120_000 + id * 4_750,
    turnover_fee: 3_500 + id * 125,
    status,
    can_edit: isDraft || status === 'Editable' || isOverdue,
    can_download_documents: !isDraft && !isOverdue,
    can_request_correction: status === 'Submitted' && id % 4 === 0,
    submitted_at: isDraft ? '' : buildSubmittedAt(year, month, Math.min(28, 5 + (id % 20))),
  }
})
