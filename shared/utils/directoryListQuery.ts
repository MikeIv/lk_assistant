export type DirectorySortDirection = 'asc' | 'desc'

export interface DirectoryListQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: string
  sortDirection: DirectorySortDirection
}

/** Общий query list-справочников: page, per_page, sort, direction, search?. */
export function buildDirectoryListQueryParams({
  page,
  perPage,
  search,
  sortKey,
  sortDirection,
}: DirectoryListQueryParams): string {
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
