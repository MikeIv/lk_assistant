import { describe, expect, it } from 'vitest'
import {
  formatReportMoney,
  formatReportPeriod,
  formatReportSubmittedAt,
  getVisiblePageNumbers,
  parseReportPeriodStart,
} from '#shared/utils/reportsFormat'
import {
  compareReportPeriods,
  matchesReportPeriodFilter,
  matchesReportStatusFilter,
} from '#shared/utils/reportsFilters'
import {
  isReportColumnKey,
  normalizeReportHeaders,
  normalizeReportItem,
  normalizeReportStatus,
} from '#shared/utils/reportsNormalize'
import { buildReportsQueryParams } from '#shared/utils/reportsQuery'
import type { ReportItem } from '#shared/types/reports'

const item = (overrides: Partial<ReportItem> = {}): ReportItem => ({
  id: 1,
  period: '2025-03-01 - 2025-03-31',
  turnover_amount: 100,
  turnover_fee: 10,
  status: 'Submitted',
  can_edit: false,
  can_download_documents: false,
  can_request_correction: false,
  submitted_at: '2025-10-08T12:00:00.000Z',
  ...overrides,
})

describe('reportsFormat', () => {
  it('parses period start and formats month label', () => {
    expect(parseReportPeriodStart('')).toBeNull()
    expect(parseReportPeriodStart('bad')).toBeNull()
    const date = parseReportPeriodStart('2025-03-01 - 2025-03-31')
    expect(date?.getFullYear()).toBe(2025)
    expect(date?.getMonth()).toBe(2)
    expect(formatReportPeriod('2025-03-01 - 2025-03-31')).toMatch(/Март 2025/i)
    expect(formatReportPeriod('')).toBe('—')
  })

  it('formats money and submitted dates with placeholders', () => {
    expect(formatReportMoney(null)).toBe('—')
    expect(formatReportMoney('x')).toBe('—')
    expect(formatReportMoney(1234.5)).toContain('234')
    expect(formatReportSubmittedAt('')).toBe('—')
    expect(formatReportSubmittedAt('not-a-date')).toBe('—')
    expect(formatReportSubmittedAt('2025-10-08T00:00:00.000Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
  })

  it('builds visible page numbers with ellipsis', () => {
    expect(getVisiblePageNumbers(1, 1)).toEqual([1])
    expect(getVisiblePageNumbers(5, 10)).toContain('ellipsis')
    expect(getVisiblePageNumbers(1, 3)).toEqual([1, 2, 3])
  })
})

describe('reportsFilters', () => {
  it('compares periods and filters by status/range', () => {
    const a = item({ period: '2025-01-01 - 2025-01-31' })
    const b = item({ period: '2025-03-01 - 2025-03-31' })

    expect(compareReportPeriods(a, b, 'default')).toBe(0)
    expect(compareReportPeriods(a, b, 'asc')).toBeLessThan(0)
    expect(compareReportPeriods(a, b, 'desc')).toBeGreaterThan(0)

    expect(matchesReportStatusFilter(a, [])).toBe(true)
    expect(matchesReportStatusFilter(a, ['Draft'])).toBe(false)
    expect(matchesReportStatusFilter(a, ['Submitted'])).toBe(true)

    expect(matchesReportPeriodFilter(a, null)).toBe(true)
    expect(matchesReportPeriodFilter(a, { from: '2025-02-01', to: '2025-02-28' })).toBe(false)
    // range.from/to парсятся как UTC Date; период — локальная дата → берём запас по краям
    expect(matchesReportPeriodFilter(a, { from: '2024-12-31', to: '2025-02-01' })).toBe(true)
  })
})

describe('reportsNormalize + reportsQuery', () => {
  it('normalizes headers/status/item', () => {
    expect(isReportColumnKey('period')).toBe(true)
    expect(isReportColumnKey('unknown')).toBe(false)
    expect(
      normalizeReportHeaders([
        { key: 'period', label: 'P' },
        { key: 'unknown' as 'period', label: 'X' },
      ]),
    ).toEqual([{ key: 'period', label: 'P' }])
    expect(normalizeReportStatus('Draft')).toBe('Draft')
    expect(normalizeReportStatus('Nope')).toBe('Submitted')
    expect(normalizeReportItem(item({ status: 'Nope' as 'Draft' })).status).toBe('Submitted')
  })

  it('builds query with sort, statuses, period and route status', () => {
    const query = buildReportsQueryParams({
      page: 2,
      perPage: 20,
      sortPeriod: 'asc',
      selectedStatuses: ['Draft', 'Overdue'],
      periodRange: { from: '2025-01-01', to: '2025-01-31' },
      statusFromRoute: 'Submitted',
    })
    const params = new URLSearchParams(query)

    expect(params.get('page')).toBe('2')
    expect(params.get('perPage')).toBe('20')
    expect(params.get('sort[0][field]')).toBe('period')
    expect(params.get('sort[0][ascending]')).toBe('asc')
    expect(params.getAll('filters[status][]')).toEqual(['Submitted', 'Draft', 'Overdue'])
    expect(params.get('filters[period][from]')).toBe('2025-01-01')

    const defaultQuery = buildReportsQueryParams({
      page: 1,
      perPage: 10,
      sortPeriod: 'default',
      selectedStatuses: [],
      periodRange: null,
    })
    expect(defaultQuery).not.toContain('sort[0]')
  })
})
