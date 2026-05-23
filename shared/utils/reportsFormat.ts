/** «2025-01-01 - 2025-01-31» или «2025-01-01» → Date начала периода. */
export function parseReportPeriodStart(period: string): Date | null {
  if (!period) {
    return null
  }

  const startRaw = period.split(' ')[0] ?? period
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startRaw)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])

  return new Date(year, month, day)
}

/** «2025-03-01 - 2025-03-31» → «Март 2025». */
export function formatReportPeriod(period: string): string {
  const date = parseReportPeriodStart(period)

  if (!date) {
    return '—'
  }

  const formatted = date
    .toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    .replace(' г.', '')

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatReportMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const num = typeof value === 'string' ? Number(value) : value

  if (Number.isNaN(num)) {
    return '—'
  }

  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** ISO → «08.10.2025». */
export function formatReportSubmittedAt(dateStr: string): string {
  if (!dateStr) {
    return '—'
  }

  const date = new Date(dateStr)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

export function getVisiblePageNumbers(
  currentPage: number,
  lastPage: number,
  delta = 2,
): Array<number | 'ellipsis'> {
  if (lastPage <= 1) {
    return [1]
  }

  const range: Array<number | 'ellipsis'> = []

  for (let page = 1; page <= lastPage; page += 1) {
    if (
      page === 1 ||
      page === lastPage ||
      (page >= currentPage - delta && page <= currentPage + delta)
    ) {
      range.push(page)
    } else if (range[range.length - 1] !== 'ellipsis') {
      range.push('ellipsis')
    }
  }

  return range
}
