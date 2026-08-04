import type { CategorySortDirection, CategorySortKey } from '#shared/types/categories'
import { buildDirectoryListQueryParams } from '#shared/utils/directoryListQuery'

interface BuildCategoriesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: CategorySortKey
  sortDirection: CategorySortDirection
}

/** Query для `brokerCategory.index` (search, sort, direction, per_page, page). */
export function buildCategoriesQueryParams(params: BuildCategoriesQueryParams): string {
  return buildDirectoryListQueryParams(params)
}
