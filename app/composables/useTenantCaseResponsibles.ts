import { API_PATHS } from '#shared/constants/api'
import type {
  TenantCaseResponsibleApiResource,
  TenantCaseResponsiblesApiResponse,
} from '#shared/types/tenantCases'
import { buildTenantCaseResponsiblesQueryParams } from '#shared/utils/tenantCasesQuery'
import { useApiConfig } from '~/composables/useApiConfig'

function normalizeResponsiblesPayload(payload: unknown): TenantCaseResponsibleApiResource[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is TenantCaseResponsibleApiResource =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as TenantCaseResponsibleApiResource).id === 'number' &&
        typeof (item as TenantCaseResponsibleApiResource).responsible === 'string',
    )
  }

  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return normalizeResponsiblesPayload((payload as { data: unknown }).data)
  }

  return []
}

/**
 * Свободные ответственные для помещения.
 * API-only: в mock возвращает пустой список (UI волны 3).
 */
export function useTenantCaseResponsibles() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const items = ref<TenantCaseResponsibleApiResource[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchResponsibles(params: {
    roomId: number | string
    tenantCaseId?: number | string | null
  }): Promise<TenantCaseResponsibleApiResource[]> {
    const roomId = String(params.roomId).trim()

    if (!roomId) {
      items.value = []
      error.value = null
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      if (isMockMode.value) {
        items.value = []
        return []
      }

      const query = buildTenantCaseResponsiblesQueryParams({
        roomId,
        tenantCaseId: params.tenantCaseId,
      })
      const response = await api<TenantCaseResponsiblesApiResponse>(
        `${API_PATHS.broker.tenantCases.responsibles}?${query}`,
      )
      const nextItems = normalizeResponsiblesPayload(response.payload)
      items.value = nextItems
      return nextItems
    } catch {
      error.value = 'Не удалось загрузить список ответственных'
      items.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  function clearResponsibles() {
    items.value = []
    error.value = null
  }

  return {
    items,
    isLoading,
    error,
    fetchResponsibles,
    clearResponsibles,
  }
}
