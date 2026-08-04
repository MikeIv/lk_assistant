import { API_PATHS } from '#shared/constants/api'
import type {
  TenantCaseResponsibleApiResource,
  TenantCaseResponsiblesApiResponse,
} from '#shared/types/tenantCases'
import { listPayloadRows, type ListPayloadShape } from '#shared/utils/listPayloadRows'
import { buildTenantCaseResponsiblesQueryParams } from '#shared/utils/tenantCasesQuery'
import { useApiConfig } from '~/composables/useApiConfig'

function normalizeResponsiblesPayload(payload: unknown): TenantCaseResponsibleApiResource[] {
  return listPayloadRows(payload as ListPayloadShape<TenantCaseResponsibleApiResource>).filter(
    (item): item is TenantCaseResponsibleApiResource =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof item.id === 'number' &&
      typeof item.responsible === 'string',
  )
}

function isValidRoomId(roomId: string): boolean {
  const numericId = Number(roomId)
  return Number.isFinite(numericId) && numericId > 0
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
  let fetchSeq = 0

  async function fetchResponsibles(params: {
    roomId: number | string
    tenantCaseId?: number | string | null
  }): Promise<TenantCaseResponsibleApiResource[]> {
    const roomId = String(params.roomId).trim()

    if (!isValidRoomId(roomId) || isMockMode.value) {
      fetchSeq += 1
      items.value = []
      error.value = null
      return []
    }

    const seq = ++fetchSeq
    isLoading.value = true
    error.value = null

    try {
      const query = buildTenantCaseResponsiblesQueryParams({
        roomId,
        tenantCaseId: params.tenantCaseId,
      })
      const response = await api<TenantCaseResponsiblesApiResponse>(
        `${API_PATHS.broker.tenantCases.responsibles}?${query}`,
      )
      const nextItems = normalizeResponsiblesPayload(response.payload)

      if (seq !== fetchSeq) {
        return nextItems
      }

      items.value = nextItems
      return nextItems
    } catch {
      if (seq !== fetchSeq) {
        return []
      }

      error.value = 'Не удалось загрузить список ответственных'
      items.value = []
      return []
    } finally {
      if (seq === fetchSeq) {
        isLoading.value = false
      }
    }
  }

  function clearResponsibles() {
    fetchSeq += 1
    items.value = []
    error.value = null
    isLoading.value = false
  }

  return {
    items,
    isLoading,
    error,
    fetchResponsibles,
    clearResponsibles,
  }
}
