import { API_PATHS } from '#shared/constants/api'
import { NEGOTIATION_STATUSES_MOCK_ITEMS } from '#shared/constants/negotiationStatusesMock'
import type {
  NegotiationStatus,
  NegotiationStatusCreateApiResponse,
  NegotiationStatusCreateFieldErrors,
  NegotiationStatusCreatePayload,
  NegotiationStatusCreateResult,
  NegotiationStatusDeleteResult,
  NegotiationStatusesListApiResponse,
  NegotiationStatusSortDirection,
  NegotiationStatusSortKey,
} from '#shared/types/negotiationStatuses'
import { normalizeNegotiationStatus } from '#shared/utils/negotiationStatusesNormalize'
import {
  buildNegotiationStatusesPagination,
  matchesNegotiationStatusSearch,
  NEGOTIATION_STATUSES_DEFAULT_PER_PAGE,
  NEGOTIATION_STATUSES_DEFAULT_SORT_DIRECTION,
  NEGOTIATION_STATUSES_DEFAULT_SORT_KEY,
  paginateNegotiationStatuses,
  sortNegotiationStatuses,
} from '#shared/utils/negotiationStatusesTable'
import {
  emptyNegotiationStatusCreateFieldErrors,
  findNegotiationStatusDuplicateErrors,
  hasNegotiationStatusCreateFieldErrors,
  normalizeNegotiationStatusCreatePayload,
  parseNegotiationStatusCreateFieldErrors,
  validateNegotiationStatusFormPayload,
} from '#shared/utils/negotiationStatusesValidation'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

function mockTimestamp(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function buildMockNegotiationStatus(id: number, name: string): NegotiationStatus {
  return {
    id,
    status: name,
    name,
    created_by_id: null,
    responsible: null,
    created_at: mockTimestamp(),
  }
}

function nextMockId(items: NegotiationStatus[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

/** Список статусов переговоров: API `brokerNegotiationStatus.index` (client-side filter/sort/page) или mock. */
export function useNegotiationStatuses() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const sourceItems = ref<NegotiationStatus[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<NegotiationStatus[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, NegotiationStatus>>(new Map())

  const allItems = computed<NegotiationStatus[]>(() => {
    if (isMockMode.value) {
      return [
        ...NEGOTIATION_STATUSES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
          (item) => mockUpdatedItems.value.get(item.id) ?? item,
        ),
        ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
      ]
    }

    return sourceItems.value
  })

  const searchQuery = ref('')
  const sortKey = ref<NegotiationStatusSortKey>(NEGOTIATION_STATUSES_DEFAULT_SORT_KEY)
  const sortDirection = ref<NegotiationStatusSortDirection>(
    NEGOTIATION_STATUSES_DEFAULT_SORT_DIRECTION,
  )
  const perPage = ref(NEGOTIATION_STATUSES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const filteredItems = computed<NegotiationStatus[]>(() => {
    const query = searchQuery.value.trim()
    const filtered = query
      ? allItems.value.filter((item) => matchesNegotiationStatusSearch(item, query))
      : allItems.value

    return sortNegotiationStatuses(filtered, sortKey.value, sortDirection.value)
  })

  const pagination = computed(() =>
    buildNegotiationStatusesPagination(
      filteredItems.value.length,
      currentPage.value,
      perPage.value,
    ),
  )

  const items = computed<NegotiationStatus[]>(() =>
    paginateNegotiationStatuses(
      filteredItems.value,
      pagination.value.currentPage,
      pagination.value.perPage,
    ),
  )

  watch(
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

  async function fetchItems(options?: { silent?: boolean }) {
    if (!options?.silent) {
      isLoading.value = true
    }
    error.value = null

    try {
      if (isMockMode.value) {
        return
      }

      const response = await api<NegotiationStatusesListApiResponse>(
        API_PATHS.broker.negotiationStatuses.list,
      )
      sourceItems.value = response.payload.items.map(normalizeNegotiationStatus)
    } catch {
      error.value = 'Не удалось загрузить список статусов переговоров'
      sourceItems.value = []
    } finally {
      if (!options?.silent) {
        isLoading.value = false
      }
    }
  }

  function setPage(page: number) {
    currentPage.value = Math.max(1, Math.min(page, pagination.value.lastPage))
  }

  function setPerPage(value: number) {
    perPage.value = value
    currentPage.value = 1
  }

  function toggleSort(key: NegotiationStatusSortKey) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = key === 'id' ? 'desc' : 'asc'
    }

    currentPage.value = 1
  }

  watch(searchQuery, () => {
    currentPage.value = 1
  })

  onMounted(() => {
    void fetchItems()
  })

  function validationFailure(
    fieldErrors: NegotiationStatusCreateFieldErrors,
  ): NegotiationStatusCreateResult {
    return { ok: false, fieldErrors, generalError: null }
  }

  function mutationFailure(cause: unknown, fallbackMessage: string): NegotiationStatusCreateResult {
    const fetchError = cause as FetchError<unknown>
    const status = fetchError.response?.status ?? fetchError.statusCode

    if (status === 422) {
      const fieldErrors = parseNegotiationStatusCreateFieldErrors(fetchError.data)

      return {
        ok: false,
        fieldErrors,
        generalError: hasNegotiationStatusCreateFieldErrors(fieldErrors) ? null : fallbackMessage,
      }
    }

    return {
      ok: false,
      fieldErrors: emptyNegotiationStatusCreateFieldErrors(),
      generalError: fallbackMessage,
    }
  }

  async function createNegotiationStatus(
    payload: NegotiationStatusCreatePayload,
  ): Promise<NegotiationStatusCreateResult> {
    const normalizedPayload = normalizeNegotiationStatusCreatePayload(payload)

    const clientFieldErrors = validateNegotiationStatusFormPayload(normalizedPayload)
    if (hasNegotiationStatusCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findNegotiationStatusDuplicateErrors(
          allItems.value,
          normalizedPayload,
        )

        if (hasNegotiationStatusCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        const nextId = nextMockId(allItems.value)

        mockExtraItems.value.push(buildMockNegotiationStatus(nextId, normalizedPayload.name))

        return { ok: true }
      }

      await api<NegotiationStatusCreateApiResponse>(API_PATHS.broker.negotiationStatuses.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      await fetchItems({ silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось создать статус переговоров')
    }
  }

  async function updateNegotiationStatus(
    id: number,
    payload: NegotiationStatusCreatePayload,
  ): Promise<NegotiationStatusCreateResult> {
    const normalizedPayload = normalizeNegotiationStatusCreatePayload(payload)

    const clientFieldErrors = validateNegotiationStatusFormPayload(normalizedPayload)
    if (hasNegotiationStatusCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findNegotiationStatusDuplicateErrors(
          allItems.value,
          normalizedPayload,
          id,
        )

        if (hasNegotiationStatusCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        const existing =
          mockUpdatedItems.value.get(id) ??
          NEGOTIATION_STATUSES_MOCK_ITEMS.find((item) => item.id === id) ??
          mockExtraItems.value.find((item) => item.id === id)

        const updatedStatus: NegotiationStatus = {
          ...buildMockNegotiationStatus(id, normalizedPayload.name),
          created_by_id: existing?.created_by_id ?? null,
          responsible: existing?.responsible ?? null,
          created_at: existing?.created_at ?? mockTimestamp(),
        }

        const extraIndex = mockExtraItems.value.findIndex((item) => item.id === id)
        if (extraIndex >= 0) {
          mockExtraItems.value.splice(extraIndex, 1, updatedStatus)
        } else {
          mockUpdatedItems.value.set(id, updatedStatus)
        }

        return { ok: true }
      }

      await api<NegotiationStatusCreateApiResponse>(
        API_PATHS.broker.negotiationStatuses.detail(id),
        {
          method: 'PUT',
          body: normalizedPayload,
        },
      )

      await fetchItems({ silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось обновить статус переговоров')
    }
  }

  async function deleteNegotiationStatus(id: number): Promise<NegotiationStatusDeleteResult> {
    try {
      if (isMockMode.value) {
        mockDeletedIds.value = new Set([...mockDeletedIds.value, id])
        mockUpdatedItems.value.delete(id)
        mockExtraItems.value = mockExtraItems.value.filter((item) => item.id !== id)

        return { ok: true }
      }

      await api(API_PATHS.broker.negotiationStatuses.detail(id), {
        method: 'DELETE',
      })

      await fetchItems({ silent: true })

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить статус переговоров',
      }
    }
  }

  return {
    items,
    pagination,
    searchQuery,
    sortKey,
    sortDirection,
    perPage,
    error,
    isLoading,
    setPage,
    setPerPage,
    toggleSort,
    refresh: () => fetchItems(),
    createNegotiationStatus,
    updateNegotiationStatus,
    deleteNegotiationStatus,
  }
}
