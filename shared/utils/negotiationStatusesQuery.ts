import type {
  NegotiationStatusSortDirection,
  NegotiationStatusSortKey,
} from '#shared/types/negotiationStatuses'
import { buildDirectoryListQueryParams } from '#shared/utils/directoryListQuery'

interface BuildNegotiationStatusesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: NegotiationStatusSortKey
  sortDirection: NegotiationStatusSortDirection
}

/** Query для `brokerNegotiationStatus.index` (search, sort, direction, per_page, page). */
export function buildNegotiationStatusesQueryParams(
  params: BuildNegotiationStatusesQueryParams,
): string {
  return buildDirectoryListQueryParams(params)
}
