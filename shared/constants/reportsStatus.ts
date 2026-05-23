import type { ReportStatus } from '#shared/types/reports'

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  CorrectionRequested: 'Запрошено исправление',
  Submitted: 'Сформирован',
  Draft: 'Черновик',
  Overdue: 'Просрочен',
  Editable: 'Доступен к исправлению',
}

/** Подписи для UI фильтра (человекочитаемые → API-ключ). */
export const REPORT_STATUS_FILTER_OPTIONS = Object.entries(REPORT_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as ReportStatus,
    label,
  }),
)

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  CorrectionRequested: 'var(--fs-figma-vertical-entertainments)',
  Submitted: 'var(--fs-color-success)',
  Draft: 'var(--fs-figma-achromatic-black)',
  Overdue: 'var(--fs-color-error)',
  Editable: '#a029cf',
}
