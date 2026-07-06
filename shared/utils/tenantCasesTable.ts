import type {
  TenantCase,
  TenantCaseSortDirection,
  TenantCaseSortKey,
  TenantCasesPagination,
  TenantCaseTableRow,
} from '#shared/types/tenantCases'

const SORT_KEYS = new Set<TenantCaseSortKey>([
  'number',
  'floor',
  'room',
  'area_m2',
  'current_tenant',
  'tenant_applicant',
  'category',
  'status',
  'first_contact_date',
  'next_contact_date',
  'responsible',
])

export function isTenantCaseSortKey(value: string): value is TenantCaseSortKey {
  return SORT_KEYS.has(value as TenantCaseSortKey)
}

function rowSearchValues(row: TenantCaseTableRow): string[] {
  return [
    String(row.number),
    row.floor,
    row.room,
    row.area_m2 === null ? '' : String(row.area_m2),
    row.current_tenant,
    row.tenant_applicant,
    row.category,
    row.status,
    row.first_contact_date ?? '',
    row.next_contact_date ?? '',
    row.negotiations_info,
    row.contacts,
    row.responsible ?? '',
  ]
}

export function matchesTenantCaseSearch(item: TenantCase, query: string): boolean {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  const caseValues = [
    String(item.id),
    item.current_tenant,
    item.responsible ?? '',
    item.room?.name ?? '',
    item.room?.floor ?? '',
  ]

  if (caseValues.some((value) => value.toLowerCase().includes(normalized))) {
    return true
  }

  return item.table_rows.some((row) =>
    rowSearchValues(row).some((value) => value.toLowerCase().includes(normalized)),
  )
}

function compareValues(
  left: string | number | null,
  right: string | number | null,
  direction: TenantCaseSortDirection,
): number {
  const factor = direction === 'asc' ? 1 : -1

  if (left === null && right === null) {
    return 0
  }

  if (left === null) {
    return factor
  }

  if (right === null) {
    return -factor
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * factor
  }

  return String(left).localeCompare(String(right), 'ru', { sensitivity: 'base' }) * factor
}

function getTenantCaseSortValue(
  item: TenantCase,
  sortKey: TenantCaseSortKey,
): string | number | null {
  const row = item.table_rows[0]

  if (!row) {
    if (sortKey === 'number') {
      return item.id
    }

    return null
  }

  switch (sortKey) {
    case 'number':
      return row.number
    case 'floor':
      return row.floor
    case 'room':
      return row.room
    case 'area_m2':
      return row.area_m2
    case 'current_tenant':
      return row.current_tenant
    case 'tenant_applicant':
      return row.tenant_applicant
    case 'category':
      return row.category
    case 'status':
      return row.status
    case 'first_contact_date':
      return row.first_contact_date
    case 'next_contact_date':
      return row.next_contact_date
    case 'responsible':
      return row.responsible
    default:
      return null
  }
}

export function compareTenantCases(
  left: TenantCase,
  right: TenantCase,
  sortKey: TenantCaseSortKey,
  direction: TenantCaseSortDirection,
): number {
  return compareValues(
    getTenantCaseSortValue(left, sortKey),
    getTenantCaseSortValue(right, sortKey),
    direction,
  )
}

export function sortTenantCases(
  items: TenantCase[],
  sortKey: TenantCaseSortKey,
  direction: TenantCaseSortDirection,
): TenantCase[] {
  return [...items].sort((left, right) => compareTenantCases(left, right, sortKey, direction))
}

export function buildTenantCasesPagination(
  total: number,
  currentPage: number,
  perPage: number,
): TenantCasesPagination {
  const safePerPage = Math.max(perPage, 1)
  const lastPage = Math.max(1, Math.ceil(total / safePerPage) || 1)
  const safePage = Math.min(Math.max(currentPage, 1), lastPage)
  const rangeFrom = total === 0 ? 0 : (safePage - 1) * safePerPage + 1
  const rangeTo = total === 0 ? 0 : Math.min(safePage * safePerPage, total)

  return {
    currentPage: safePage,
    lastPage,
    perPage: safePerPage,
    total,
    rangeFrom,
    rangeTo,
  }
}

export function toTenantCasesApiPagination(payload: {
  current_page: number
  last_page: number
  per_page: number
  total: number
}): TenantCasesPagination {
  const { total, current_page: currentPage, per_page: perPage, last_page: lastPage } = payload
  const rangeFrom = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const rangeTo = total === 0 ? 0 : Math.min(currentPage * perPage, total)

  return { currentPage, lastPage, perPage, total, rangeFrom, rangeTo }
}

export function paginateTenantCases(
  items: TenantCase[],
  currentPage: number,
  perPage: number,
): TenantCase[] {
  const start = (currentPage - 1) * perPage

  return items.slice(start, start + perPage)
}

export const TENANT_CASES_PER_PAGE_OPTIONS = [10, 25, 50] as const

export const TENANT_CASES_DEFAULT_PER_PAGE = 10

export const TENANT_CASES_DEFAULT_SORT_KEY: TenantCaseSortKey = 'number'

export const TENANT_CASES_DEFAULT_SORT_DIRECTION: TenantCaseSortDirection = 'desc'

export const TENANT_CASE_APPLICANT_STATUS_OPTIONS = [
  'переговоры',
  'отказ',
  'отказ с нашей стороны',
] as const
