import type { TenantCaseSortDirection, TenantCaseSortKey } from '#shared/types/tenantCases'

interface BuildTenantCasesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: TenantCaseSortKey
  sortDirection: TenantCaseSortDirection
  /** JWT `sub` — бэк фильтрует список по роли (брокер / руководитель). */
  userId?: string | null
}

/** Query для `brokerTenantCase.index` (search, sort, direction, per_page, page, user_id). */
export function buildTenantCasesQueryParams({
  page,
  perPage,
  search,
  sortKey,
  sortDirection,
  userId,
}: BuildTenantCasesQueryParams): string {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort: sortKey,
    direction: sortDirection,
  })

  const trimmedSearch = search.trim()

  if (trimmedSearch) {
    params.set('search', trimmedSearch)
  }

  const trimmedUserId = userId?.trim()
  if (trimmedUserId) {
    params.set('user_id', trimmedUserId)
  }

  return params.toString()
}
