import type { LegalEntitySortDirection, LegalEntitySortKey } from '#shared/types/legalEntities'
import { buildDirectoryListQueryParams } from '#shared/utils/directoryListQuery'

interface BuildLegalEntitiesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: LegalEntitySortKey
  sortDirection: LegalEntitySortDirection
}

/** Query для `brokerLegalEntity.index` (search, sort, direction, per_page, page). */
export function buildLegalEntitiesQueryParams(params: BuildLegalEntitiesQueryParams): string {
  return buildDirectoryListQueryParams(params)
}
