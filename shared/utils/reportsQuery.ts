import type { ReportPeriodRange, ReportPeriodSort, ReportStatus } from '#shared/types/reports'

interface BuildReportsQueryParams {
  page: number
  perPage: number
  sortPeriod: ReportPeriodSort
  selectedStatuses: ReportStatus[]
  periodRange: ReportPeriodRange | null
  statusFromRoute?: string
}

export function buildReportsQueryParams({
  page,
  perPage,
  sortPeriod,
  selectedStatuses,
  periodRange,
  statusFromRoute,
}: BuildReportsQueryParams): string {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  })

  if (sortPeriod !== 'default') {
    params.append('sort[0][field]', 'period')
    params.append('sort[0][ascending]', sortPeriod)
  }

  if (statusFromRoute) {
    params.append('filters[status][]', statusFromRoute)
  }

  if (periodRange) {
    params.append('filters[period][from]', periodRange.from)
    params.append('filters[period][to]', periodRange.to)
  }

  selectedStatuses.forEach((status) => {
    params.append('filters[status][]', status)
  })

  return params.toString()
}
