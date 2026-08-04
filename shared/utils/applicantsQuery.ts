import type { ApplicantSortDirection, ApplicantSortKey } from '#shared/types/applicants'
import { buildDirectoryListQueryParams } from '#shared/utils/directoryListQuery'

interface BuildApplicantsQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: ApplicantSortKey
  sortDirection: ApplicantSortDirection
}

/** Query для `brokerTenantApplicant.index` (search, sort, direction, per_page, page). */
export function buildApplicantsQueryParams(params: BuildApplicantsQueryParams): string {
  return buildDirectoryListQueryParams(params)
}
