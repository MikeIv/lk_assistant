export interface DirectoryApiPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface DirectoryPaginationView {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  rangeFrom: number
  rangeTo: number
}

/** Пагинация из payload list-справочника (без пересчёта last_page на клиенте). */
export function toDirectoryApiPagination(
  payload: DirectoryApiPaginationMeta,
): DirectoryPaginationView {
  const { total, current_page: currentPage, per_page: perPage, last_page: lastPage } = payload
  const rangeFrom = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const rangeTo = total === 0 ? 0 : Math.min(currentPage * perPage, total)

  return { currentPage, lastPage, perPage, total, rangeFrom, rangeTo }
}
