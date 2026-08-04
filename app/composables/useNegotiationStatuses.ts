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
  NegotiationStatusesPagination,
  NegotiationStatusSortDirection,
  NegotiationStatusSortKey,
} from '#shared/types/negotiationStatuses'
import { normalizeNegotiationStatus } from '#shared/utils/negotiationStatusesNormalize'
import { buildNegotiationStatusesQueryParams } from '#shared/utils/negotiationStatusesQuery'
import {
  buildNegotiationStatusesPagination,
  matchesNegotiationStatusSearch,
  NEGOTIATION_STATUSES_DEFAULT_PER_PAGE,
  NEGOTIATION_STATUSES_DEFAULT_SORT_DIRECTION,
  NEGOTIATION_STATUSES_DEFAULT_SORT_KEY,
  paginateNegotiationStatuses,
  sortNegotiationStatuses,
  toNegotiationStatusesApiPagination,
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

const SEARCH_DEBOUNCE_MS = 300

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

/** Список статусов переговоров: API `brokerNegotiationStatus.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function useNegotiationStatuses() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiResponse = ref<NegotiationStatusesListApiResponse | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<NegotiationStatus[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, NegotiationStatus>>(new Map())

  const mockSourceItems = computed<NegotiationStatus[]>(() => [
    ...NEGOTIATION_STATUSES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
      (item) => mockUpdatedItems.value.get(item.id) ?? item,
    ),
    ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
  ])

  const searchQuery = ref('')
  const sortKey = ref<NegotiationStatusSortKey>(NEGOTIATION_STATUSES_DEFAULT_SORT_KEY)
  const sortDirection = ref<NegotiationStatusSortDirection>(
    NEGOTIATION_STATUSES_DEFAULT_SORT_DIRECTION,
  )
  const perPage = ref(NEGOTIATION_STATUSES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const mockSortedItems = computed<NegotiationStatus[]>(() => {
    if (!isMockMode.value) {
      return []
    }

    const query = searchQuery.value.trim()
    const filtered = query
      ? mockSourceItems.value.filter((item) => matchesNegotiationStatusSearch(item, query))
      : mockSourceItems.value

    return sortNegotiationStatuses(filtered, sortKey.value, sortDirection.value)
  })

  const mockPagination = computed<NegotiationStatusesPagination>(() =>
    isMockMode.value
      ? buildNegotiationStatusesPagination(
          mockSortedItems.value.length,
          currentPage.value,
          perPage.value,
        )
      : buildNegotiationStatusesPagination(0, 1, perPage.value),
  )

  const mockItems = computed<NegotiationStatus[]>(() =>
    isMockMode.value
      ? paginateNegotiationStatuses(mockSortedItems.value, currentPage.value, perPage.value)
      : [],
  )

  const apiPagination = computed<NegotiationStatusesPagination>(() => {
    const payload = apiResponse.value?.payload

    return payload
      ? toNegotiationStatusesApiPagination(payload)
      : buildNegotiationStatusesPagination(0, 1, perPage.value)
  })

  const pagination = computed<NegotiationStatusesPagination>(() =>
    isMockMode.value ? mockPagination.value : apiPagination.value,
  )

  const items = computed<NegotiationStatus[]>(() => {
    if (isMockMode.value) {
      return mockItems.value
    }

    return (apiResponse.value?.payload.data ?? []).map(normalizeNegotiationStatus)
  })

  watch(
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

  async function fetchItems(page = currentPage.value, options?: { silent?: boolean }) {
    if (!options?.silent) {
      isLoading.value = true
    }
    error.value = null

    try {
      if (isMockMode.value) {
        return
      }

      const query = buildNegotiationStatusesQueryParams({
        page,
        perPage: perPage.value,
        search: searchQuery.value,
        sortKey: sortKey.value,
        sortDirection: sortDirection.value,
      })

      apiResponse.value = await api<NegotiationStatusesListApiResponse>(
        `${API_PATHS.broker.negotiationStatuses.list}?${query}`,
      )
      currentPage.value = apiResponse.value.payload.current_page
    } catch {
      error.value = 'Не удалось загрузить список статусов переговоров'
      apiResponse.value = null
    } finally {
      if (!options?.silent) {
        isLoading.value = false
      }
    }
  }

  function fetchApiPage(page: number) {
    if (!isMockMode.value) {
      void fetchItems(page)
    }
  }

  function setPage(page: number) {
    currentPage.value = Math.max(1, Math.min(page, pagination.value.lastPage))
    fetchApiPage(currentPage.value)
  }

  function setPerPage(value: number) {
    perPage.value = value
    currentPage.value = 1
    fetchApiPage(1)
  }

  function toggleSort(key: NegotiationStatusSortKey) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = key === 'id' ? 'desc' : 'asc'
    }

    currentPage.value = 1
    fetchApiPage(1)
  }

  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

  watch(searchQuery, () => {
    currentPage.value = 1

    if (isMockMode.value) {
      return
    }

    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => fetchApiPage(1), SEARCH_DEBOUNCE_MS)
  })

  onMounted(() => {
    void fetchItems()
  })

  onUnmounted(() => {
    clearTimeout(searchDebounceTimer)
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
          mockSourceItems.value,
          normalizedPayload,
        )

        if (hasNegotiationStatusCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        const nextId = nextMockId(mockSourceItems.value)

        mockExtraItems.value.push(buildMockNegotiationStatus(nextId, normalizedPayload.name))

        return { ok: true }
      }

      await api<NegotiationStatusCreateApiResponse>(API_PATHS.broker.negotiationStatuses.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

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
          mockSourceItems.value,
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

      await fetchItems(currentPage.value, { silent: true })

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

      await fetchItems(currentPage.value, { silent: true })

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
