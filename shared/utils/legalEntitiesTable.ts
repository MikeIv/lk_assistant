import type {
  LegalEntitiesPagination,
  LegalEntity,
  LegalEntitySortDirection,
  LegalEntitySortKey,
} from '#shared/types/legalEntities'

const SORT_KEYS = new Set<LegalEntitySortKey>(['id', 'legal_entity', 'inn', 'kpp'])

export function isLegalEntitySortKey(value: string): value is LegalEntitySortKey {
  return SORT_KEYS.has(value as LegalEntitySortKey)
}

export function matchesLegalEntitySearch(item: LegalEntity, query: string): boolean {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  const haystack = [String(item.id), item.legal_entity, item.inn, item.kpp ?? '']

  return haystack.some((value) => value.toLowerCase().includes(normalized))
}

function compareValues(
  left: string | number | null,
  right: string | number | null,
  direction: LegalEntitySortDirection,
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

export function compareLegalEntities(
  left: LegalEntity,
  right: LegalEntity,
  sortKey: LegalEntitySortKey,
  direction: LegalEntitySortDirection,
): number {
  switch (sortKey) {
    case 'id':
      return compareValues(left.id, right.id, direction)
    case 'legal_entity':
      return compareValues(left.legal_entity, right.legal_entity, direction)
    case 'inn':
      return compareValues(left.inn, right.inn, direction)
    case 'kpp':
      return compareValues(left.kpp, right.kpp, direction)
    default:
      return 0
  }
}

export function sortLegalEntities(
  items: LegalEntity[],
  sortKey: LegalEntitySortKey,
  direction: LegalEntitySortDirection,
): LegalEntity[] {
  return [...items].sort((left, right) => compareLegalEntities(left, right, sortKey, direction))
}

export function buildLegalEntitiesPagination(
  total: number,
  currentPage: number,
  perPage: number,
): LegalEntitiesPagination {
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

/** Пагинация из payload `brokerLegalEntity.index` (без пересчёта last_page на клиенте). */
export function toLegalEntitiesApiPagination(payload: {
  current_page: number
  last_page: number
  per_page: number
  total: number
}): LegalEntitiesPagination {
  const { total, current_page: currentPage, per_page: perPage, last_page: lastPage } = payload
  const rangeFrom = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const rangeTo = total === 0 ? 0 : Math.min(currentPage * perPage, total)

  return { currentPage, lastPage, perPage, total, rangeFrom, rangeTo }
}

export function paginateLegalEntities(
  items: LegalEntity[],
  currentPage: number,
  perPage: number,
): LegalEntity[] {
  const start = (currentPage - 1) * perPage

  return items.slice(start, start + perPage)
}

export const LEGAL_ENTITIES_PER_PAGE_OPTIONS = [10, 25, 50] as const

export const LEGAL_ENTITIES_DEFAULT_PER_PAGE = 10

export const LEGAL_ENTITIES_DEFAULT_SORT_KEY: LegalEntitySortKey = 'id'

export const LEGAL_ENTITIES_DEFAULT_SORT_DIRECTION: LegalEntitySortDirection = 'desc'
