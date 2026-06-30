import type {
  Premise,
  PremiseSortDirection,
  PremiseSortKey,
  PremisesPagination,
} from '#shared/types/premises'

const SORT_KEYS = new Set<PremiseSortKey>([
  'id',
  'name',
  'floor',
  'area',
  'room_type',
  'name_bti',
  'floor_bti',
  'area_bti',
])

export function isPremiseSortKey(value: string): value is PremiseSortKey {
  return SORT_KEYS.has(value as PremiseSortKey)
}

export function matchesPremiseSearch(item: Premise, query: string): boolean {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  const haystack = [
    String(item.id),
    item.name,
    item.floor ?? '',
    item.area !== null ? String(item.area) : '',
    item.room_type ?? '',
    item.name_bti ?? '',
    item.floor_bti ?? '',
    item.area_bti !== null ? String(item.area_bti) : '',
  ]

  return haystack.some((value) => value.toLowerCase().includes(normalized))
}

function compareValues(
  left: string | number | null,
  right: string | number | null,
  direction: PremiseSortDirection,
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

export function comparePremises(
  left: Premise,
  right: Premise,
  sortKey: PremiseSortKey,
  direction: PremiseSortDirection,
): number {
  switch (sortKey) {
    case 'id':
      return compareValues(left.id, right.id, direction)
    case 'name':
      return compareValues(left.name, right.name, direction)
    case 'floor':
      return compareValues(left.floor, right.floor, direction)
    case 'area':
      return compareValues(left.area, right.area, direction)
    case 'room_type':
      return compareValues(left.room_type, right.room_type, direction)
    case 'name_bti':
      return compareValues(left.name_bti, right.name_bti, direction)
    case 'floor_bti':
      return compareValues(left.floor_bti, right.floor_bti, direction)
    case 'area_bti':
      return compareValues(left.area_bti, right.area_bti, direction)
    default:
      return 0
  }
}

export function sortPremises(
  items: Premise[],
  sortKey: PremiseSortKey,
  direction: PremiseSortDirection,
): Premise[] {
  return [...items].sort((left, right) => comparePremises(left, right, sortKey, direction))
}

export function buildPremisesPagination(
  total: number,
  currentPage: number,
  perPage: number,
): PremisesPagination {
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

export function paginatePremises(
  items: Premise[],
  currentPage: number,
  perPage: number,
): Premise[] {
  const start = (currentPage - 1) * perPage

  return items.slice(start, start + perPage)
}

export const PREMISES_PER_PAGE_OPTIONS = [10, 25, 50] as const

export const PREMISES_DEFAULT_PER_PAGE = 10

export const PREMISES_DEFAULT_SORT_KEY: PremiseSortKey = 'id'

export const PREMISES_DEFAULT_SORT_DIRECTION: PremiseSortDirection = 'desc'
