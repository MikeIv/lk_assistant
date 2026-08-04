import type { TenantCaseSortDirection, TenantCaseSortKey } from '#shared/types/tenantCases'

interface BuildTenantCasesQueryParams {
  page: number
  perPage: number
  search: string
  sortKey: TenantCaseSortKey
  sortDirection: TenantCaseSortDirection
  /** JWT `sub` — бэк фильтрует список по роли (брокер / руководитель). */
  userId?: string | null
}

interface BuildTenantCaseResponsiblesQueryParams {
  roomId: number | string
  /** Чтобы текущий ответственный не выпадал из списка при edit. */
  tenantCaseId?: number | string | null
}

/** Query для `brokerTenantCase.index` (search, sort, direction, per_page, page, user_id). */
export function buildTenantCasesQueryParams({
  page,
  perPage,
  search,
  sortKey,
  sortDirection,
  userId,
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

  const trimmedUserId = userId?.trim()
  if (trimmedUserId) {
    params.set('user_id', trimmedUserId)
  }

  return params.toString()
}

/** Query для `GET /v1/broker/tenant-cases/responsibles`. */
export function buildTenantCaseResponsiblesQueryParams({
  roomId,
  tenantCaseId,
}: BuildTenantCaseResponsiblesQueryParams): string {
  const params = new URLSearchParams({
    room_id: String(roomId),
  })

  if (tenantCaseId !== undefined && tenantCaseId !== null && String(tenantCaseId).trim()) {
    params.set('tenant_case_id', String(tenantCaseId))
  }

  return params.toString()
}
