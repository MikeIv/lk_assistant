import type {
  Applicant,
  ApplicantsPagination,
  ApplicantSortDirection,
  ApplicantSortKey,
} from '#shared/types/applicants'

export function matchesApplicantSearch(item: Applicant, query: string): boolean {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  const legalEntityNames = item.legal_entities.map((entity) => entity.legal_entity).join(' ')
  const haystack = [
    String(item.id),
    item.title,
    item.company_group ?? '',
    item.category_name ?? String(item.category_id),
    legalEntityNames,
  ]

  return haystack.some((value) => value.toLowerCase().includes(normalized))
}

function compareValues(
  left: string | number | null,
  right: string | number | null,
  direction: ApplicantSortDirection,
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

export function compareApplicants(
  left: Applicant,
  right: Applicant,
  sortKey: ApplicantSortKey,
  direction: ApplicantSortDirection,
): number {
  switch (sortKey) {
    case 'id':
      return compareValues(left.id, right.id, direction)
    case 'title':
      return compareValues(left.title, right.title, direction)
    case 'company_group':
      return compareValues(left.company_group, right.company_group, direction)
    case 'category_id':
      return compareValues(
        left.category_name ?? left.category_id,
        right.category_name ?? right.category_id,
        direction,
      )
    default:
      return 0
  }
}

export function sortApplicants(
  items: Applicant[],
  sortKey: ApplicantSortKey,
  direction: ApplicantSortDirection,
): Applicant[] {
  return [...items].sort((left, right) => compareApplicants(left, right, sortKey, direction))
}

export function buildApplicantsPagination(
  total: number,
  currentPage: number,
  perPage: number,
): ApplicantsPagination {
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

export function toApplicantsApiPagination(payload: {
  current_page: number
  last_page: number
  per_page: number
  total: number
}): ApplicantsPagination {
  const { total, current_page: currentPage, per_page: perPage, last_page: lastPage } = payload
  const rangeFrom = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const rangeTo = total === 0 ? 0 : Math.min(currentPage * perPage, total)

  return { currentPage, lastPage, perPage, total, rangeFrom, rangeTo }
}

export function paginateApplicants(
  items: Applicant[],
  currentPage: number,
  perPage: number,
): Applicant[] {
  const start = (currentPage - 1) * perPage

  return items.slice(start, start + perPage)
}

export const APPLICANTS_PER_PAGE_OPTIONS = [10, 25, 50] as const

export const APPLICANTS_DEFAULT_PER_PAGE = 10

export const APPLICANTS_DEFAULT_SORT_KEY: ApplicantSortKey = 'id'

export const APPLICANTS_DEFAULT_SORT_DIRECTION: ApplicantSortDirection = 'desc'

export const APPLICANTS_MAX_LEGAL_ENTITIES = 5
