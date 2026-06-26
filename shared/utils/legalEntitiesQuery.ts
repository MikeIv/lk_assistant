import type { LegalEntitySortDirection, LegalEntitySortKey } from '#shared/types/legalEntities'

interface BuildLegalEntitiesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: LegalEntitySortKey
  sortDirection: LegalEntitySortDirection
}

/** Query для `brokerLegalEntity.index` (search, sort, direction, per_page, page). */
export function buildLegalEntitiesQueryParams({
  page,
  perPage,
  search,
  sortKey,
  sortDirection,
}: BuildLegalEntitiesQueryParams): string {
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
