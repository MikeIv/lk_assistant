import type {
  NegotiationStatus,
  NegotiationStatusesPagination,
  NegotiationStatusSortDirection,
  NegotiationStatusSortKey,
} from '#shared/types/negotiationStatuses'

export function matchesNegotiationStatusSearch(item: NegotiationStatus, query: string): boolean {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  const haystack = [String(item.id), item.name, item.status]

  return haystack.some((value) => value.toLowerCase().includes(normalized))
}

function compareValues(
  left: string | number,
  right: string | number,
  direction: NegotiationStatusSortDirection,
): number {
  const factor = direction === 'asc' ? 1 : -1

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * factor
  }

  return String(left).localeCompare(String(right), 'ru', { sensitivity: 'base' }) * factor
}

export function compareNegotiationStatuses(
  left: NegotiationStatus,
  right: NegotiationStatus,
  sortKey: NegotiationStatusSortKey,
  direction: NegotiationStatusSortDirection,
): number {
  switch (sortKey) {
    case 'id':
      return compareValues(left.id, right.id, direction)
    case 'name':
      return compareValues(left.name, right.name, direction)
    default:
      return 0
  }
}

export function sortNegotiationStatuses(
  items: NegotiationStatus[],
  sortKey: NegotiationStatusSortKey,
  direction: NegotiationStatusSortDirection,
): NegotiationStatus[] {
  return [...items].sort((left, right) =>
    compareNegotiationStatuses(left, right, sortKey, direction),
  )
}

export function buildNegotiationStatusesPagination(
  total: number,
  currentPage: number,
  perPage: number,
): NegotiationStatusesPagination {
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

export function paginateNegotiationStatuses(
  items: NegotiationStatus[],
  currentPage: number,
  perPage: number,
): NegotiationStatus[] {
  const start = (currentPage - 1) * perPage

  return items.slice(start, start + perPage)
}

export const NEGOTIATION_STATUSES_PER_PAGE_OPTIONS = [10, 25, 50] as const

export const NEGOTIATION_STATUSES_DEFAULT_PER_PAGE = 10

export const NEGOTIATION_STATUSES_DEFAULT_SORT_KEY: NegotiationStatusSortKey = 'id'

export const NEGOTIATION_STATUSES_DEFAULT_SORT_DIRECTION: NegotiationStatusSortDirection = 'desc'
