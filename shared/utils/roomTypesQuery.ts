import type { RoomTypeSortDirection, RoomTypeSortKey } from '#shared/types/roomTypes'
import { buildDirectoryListQueryParams } from '#shared/utils/directoryListQuery'

interface BuildRoomTypesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: RoomTypeSortKey
  sortDirection: RoomTypeSortDirection
}

/** Query для `brokerRoomType.index` (search, sort, direction, per_page, page). */
export function buildRoomTypesQueryParams(params: BuildRoomTypesQueryParams): string {
  return buildDirectoryListQueryParams(params)
}
