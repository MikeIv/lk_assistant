import type {
  Category,
  CategoriesPagination,
  CategorySortDirection,
  CategorySortKey,
} from '#shared/types/categories'

export function matchesCategorySearch(item: Category, query: string): boolean {
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
  direction: CategorySortDirection,
): number {
  const factor = direction === 'asc' ? 1 : -1

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * factor
  }

  return String(left).localeCompare(String(right), 'ru', { sensitivity: 'base' }) * factor
}

export function compareCategories(
  left: Category,
  right: Category,
  sortKey: CategorySortKey,
  direction: CategorySortDirection,
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

export function sortCategories(
  items: Category[],
  sortKey: CategorySortKey,
  direction: CategorySortDirection,
): Category[] {
  return [...items].sort((left, right) => compareCategories(left, right, sortKey, direction))
}

export function buildCategoriesPagination(
  total: number,
  currentPage: number,
  perPage: number,
): CategoriesPagination {
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

export function paginateCategories(
  items: Category[],
  currentPage: number,
  perPage: number,
): Category[] {
  const start = (currentPage - 1) * perPage

  return items.slice(start, start + perPage)
}

export const CATEGORIES_PER_PAGE_OPTIONS = [10, 25, 50] as const

export const CATEGORIES_DEFAULT_PER_PAGE = 10

export const CATEGORIES_DEFAULT_SORT_KEY: CategorySortKey = 'id'

export const CATEGORIES_DEFAULT_SORT_DIRECTION: CategorySortDirection = 'desc'
