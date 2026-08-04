import type { PremiseSortDirection, PremiseSortKey } from '#shared/types/premises'
import { buildDirectoryListQueryParams } from '#shared/utils/directoryListQuery'

interface BuildPremisesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: PremiseSortKey
  sortDirection: PremiseSortDirection
}

/** Query для `brokerRoom.index` (search, sort, direction, per_page, page). */
export function buildPremisesQueryParams(params: BuildPremisesQueryParams): string {
  return buildDirectoryListQueryParams(params)
}
