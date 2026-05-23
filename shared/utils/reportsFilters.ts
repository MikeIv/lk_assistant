import { parseReportPeriodStart } from '#shared/utils/reportsFormat'
import type {
  ReportItem,
  ReportPeriodRange,
  ReportPeriodSort,
  ReportStatus,
} from '#shared/types/reports'

export function compareReportPeriods(
  a: ReportItem,
  b: ReportItem,
  order: ReportPeriodSort,
): number {
  const dateA = parseReportPeriodStart(a.period)?.getTime() ?? 0
  const dateB = parseReportPeriodStart(b.period)?.getTime() ?? 0

  if (order === 'default') {
    return 0
  }

  return order === 'asc' ? dateA - dateB : dateB - dateA
}

export function matchesReportStatusFilter(item: ReportItem, statuses: ReportStatus[]): boolean {
  if (!statuses.length) {
    return true
  }

  return statuses.includes(item.status)
}

export function matchesReportPeriodFilter(
  item: ReportItem,
  range: ReportPeriodRange | null,
): boolean {
  if (!range) {
    return true
  }

  const start = parseReportPeriodStart(item.period)

  if (!start) {
    return false
  }

  const from = new Date(range.from)
  const to = new Date(range.to)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return true
  }

  return start >= from && start <= to
}
