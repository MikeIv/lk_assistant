import type { ApplicantSortDirection, ApplicantSortKey } from '#shared/types/applicants'

interface BuildApplicantsQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: ApplicantSortKey
  sortDirection: ApplicantSortDirection
}

/** Query для `brokerTenantApplicant.index` (search, sort, direction, per_page, page). */
export function buildApplicantsQueryParams({
  page,
  perPage,
  search,
  sortKey,
  sortDirection,
}: BuildApplicantsQueryParams): string {
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
