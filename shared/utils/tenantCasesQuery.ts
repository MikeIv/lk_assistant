import type { TenantCaseSortDirection, TenantCaseSortKey } from '#shared/types/tenantCases'

interface BuildTenantCasesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: TenantCaseSortKey
  sortDirection: TenantCaseSortDirection
}

/** Query для `brokerTenantCase.index` (search, sort, direction, per_page, page). */
export function buildTenantCasesQueryParams({
  page,
  perPage,
  search,
  sortKey,
  sortDirection,
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

  return params.toString()
}
