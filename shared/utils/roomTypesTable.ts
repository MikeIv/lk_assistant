import type {
  RoomType,
  RoomTypesPagination,
  RoomTypeSortDirection,
  RoomTypeSortKey,
} from '#shared/types/roomTypes'

export function matchesRoomTypeSearch(item: RoomType, query: string): boolean {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  const haystack = [String(item.id), item.name]

  return haystack.some((value) => value.toLowerCase().includes(normalized))
}

function compareValues(
  left: string | number,
  right: string | number,
  direction: RoomTypeSortDirection,
): number {
  const factor = direction === 'asc' ? 1 : -1

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * factor
  }

  return String(left).localeCompare(String(right), 'ru', { sensitivity: 'base' }) * factor
}

export function compareRoomTypes(
  left: RoomType,
  right: RoomType,
  sortKey: RoomTypeSortKey,
  direction: RoomTypeSortDirection,
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

export function sortRoomTypes(
  items: RoomType[],
  sortKey: RoomTypeSortKey,
  direction: RoomTypeSortDirection,
): RoomType[] {
  return [...items].sort((left, right) => compareRoomTypes(left, right, sortKey, direction))
}

export function buildRoomTypesPagination(
  total: number,
  currentPage: number,
  perPage: number,
): RoomTypesPagination {
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

export function paginateRoomTypes(
  items: RoomType[],
  currentPage: number,
  perPage: number,
): RoomType[] {
  const start = (currentPage - 1) * perPage

  return items.slice(start, start + perPage)
}

export const ROOM_TYPES_PER_PAGE_OPTIONS = [10, 25, 50] as const

export const ROOM_TYPES_DEFAULT_PER_PAGE = 10

export const ROOM_TYPES_DEFAULT_SORT_KEY: RoomTypeSortKey = 'id'

export const ROOM_TYPES_DEFAULT_SORT_DIRECTION: RoomTypeSortDirection = 'desc'
