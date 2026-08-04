import { API_PATHS } from '#shared/constants/api'
import { ROOM_TYPES_MOCK_ITEMS } from '#shared/constants/roomTypesMock'
import type {
  RoomType,
  RoomTypeCreateApiResponse,
  RoomTypeCreateFieldErrors,
  RoomTypeCreatePayload,
  RoomTypeCreateResult,
  RoomTypeDeleteResult,
  RoomTypesListApiResponse,
  RoomTypesPagination,
  RoomTypeSortDirection,
  RoomTypeSortKey,
} from '#shared/types/roomTypes'
import { normalizeRoomType } from '#shared/utils/roomTypesNormalize'
import { buildRoomTypesQueryParams } from '#shared/utils/roomTypesQuery'
import {
  buildRoomTypesPagination,
  matchesRoomTypeSearch,
  paginateRoomTypes,
  ROOM_TYPES_DEFAULT_PER_PAGE,
  ROOM_TYPES_DEFAULT_SORT_DIRECTION,
  ROOM_TYPES_DEFAULT_SORT_KEY,
  sortRoomTypes,
  toRoomTypesApiPagination,
} from '#shared/utils/roomTypesTable'
import {
  emptyRoomTypeCreateFieldErrors,
  findRoomTypeDuplicateErrors,
  hasRoomTypeCreateFieldErrors,
  normalizeRoomTypeCreatePayload,
  parseRoomTypeCreateFieldErrors,
  validateRoomTypeFormPayload,
} from '#shared/utils/roomTypesValidation'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

const SEARCH_DEBOUNCE_MS = 300

/** Список типов помещений: API `brokerRoomType.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function useRoomTypes() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiResponse = ref<RoomTypesListApiResponse | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<RoomType[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, RoomType>>(new Map())

  const mockSourceItems = computed<RoomType[]>(() => [
    ...ROOM_TYPES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
      (item) => mockUpdatedItems.value.get(item.id) ?? item,
    ),
    ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
  ])

  const searchQuery = ref('')
  const sortKey = ref<RoomTypeSortKey>(ROOM_TYPES_DEFAULT_SORT_KEY)
  const sortDirection = ref<RoomTypeSortDirection>(ROOM_TYPES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(ROOM_TYPES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const mockSortedItems = computed<RoomType[]>(() => {
    if (!isMockMode.value) {
      return []
    }

    const query = searchQuery.value.trim()
    const filtered = query
      ? mockSourceItems.value.filter((item) => matchesRoomTypeSearch(item, query))
      : mockSourceItems.value

    return sortRoomTypes(filtered, sortKey.value, sortDirection.value)
  })

  const mockPagination = computed<RoomTypesPagination>(() =>
    isMockMode.value
      ? buildRoomTypesPagination(mockSortedItems.value.length, currentPage.value, perPage.value)
      : buildRoomTypesPagination(0, 1, perPage.value),
  )

  const mockItems = computed<RoomType[]>(() =>
    isMockMode.value
      ? paginateRoomTypes(mockSortedItems.value, currentPage.value, perPage.value)
      : [],
  )

  const apiPagination = computed<RoomTypesPagination>(() => {
    const payload = apiResponse.value?.payload

    return payload
      ? toRoomTypesApiPagination(payload)
      : buildRoomTypesPagination(0, 1, perPage.value)
  })

  const pagination = computed<RoomTypesPagination>(() =>
    isMockMode.value ? mockPagination.value : apiPagination.value,
  )

  const items = computed<RoomType[]>(() => {
    if (isMockMode.value) {
      return mockItems.value
    }

    return (apiResponse.value?.payload.data ?? []).map(normalizeRoomType)
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

      const query = buildRoomTypesQueryParams({
        page,
        perPage: perPage.value,
        search: searchQuery.value,
        sortKey: sortKey.value,
        sortDirection: sortDirection.value,
      })

      apiResponse.value = await api<RoomTypesListApiResponse>(
        `${API_PATHS.broker.roomTypes.list}?${query}`,
      )
      currentPage.value = apiResponse.value.payload.current_page
    } catch {
      error.value = 'Не удалось загрузить список типов помещений'
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

  function toggleSort(key: RoomTypeSortKey) {
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

  function validationFailure(fieldErrors: RoomTypeCreateFieldErrors): RoomTypeCreateResult {
    return { ok: false, fieldErrors, generalError: null }
  }

  function mutationFailure(cause: unknown, fallbackMessage: string): RoomTypeCreateResult {
    const fetchError = cause as FetchError<unknown>
    const status = fetchError.response?.status ?? fetchError.statusCode

    if (status === 422) {
      const fieldErrors = parseRoomTypeCreateFieldErrors(fetchError.data)

      return {
        ok: false,
        fieldErrors,
        generalError: hasRoomTypeCreateFieldErrors(fieldErrors) ? null : fallbackMessage,
      }
    }

    return {
      ok: false,
      fieldErrors: emptyRoomTypeCreateFieldErrors(),
      generalError: fallbackMessage,
    }
  }

  async function createRoomType(payload: RoomTypeCreatePayload): Promise<RoomTypeCreateResult> {
    const normalizedPayload = normalizeRoomTypeCreatePayload(payload)

    const clientFieldErrors = validateRoomTypeFormPayload(normalizedPayload)
    if (hasRoomTypeCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findRoomTypeDuplicateErrors(
          mockSourceItems.value,
          normalizedPayload,
        )

        if (hasRoomTypeCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        mockExtraItems.value.push({
          id: ROOM_TYPES_MOCK_ITEMS.length + mockExtraItems.value.length + 1,
          name: normalizedPayload.name,
        })

        return { ok: true }
      }

      await api<RoomTypeCreateApiResponse>(API_PATHS.broker.roomTypes.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось создать тип помещения')
    }
  }

  async function updateRoomType(
    id: number,
    payload: RoomTypeCreatePayload,
  ): Promise<RoomTypeCreateResult> {
    const normalizedPayload = normalizeRoomTypeCreatePayload(payload)

    const clientFieldErrors = validateRoomTypeFormPayload(normalizedPayload)
    if (hasRoomTypeCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findRoomTypeDuplicateErrors(
          mockSourceItems.value,
          normalizedPayload,
          id,
        )

        if (hasRoomTypeCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        const updatedRoomType: RoomType = {
          id,
          name: normalizedPayload.name,
        }

        const extraIndex = mockExtraItems.value.findIndex((item) => item.id === id)
        if (extraIndex >= 0) {
          mockExtraItems.value.splice(extraIndex, 1, updatedRoomType)
        } else {
          mockUpdatedItems.value.set(id, updatedRoomType)
        }

        return { ok: true }
      }

      await api<RoomTypeCreateApiResponse>(API_PATHS.broker.roomTypes.detail(id), {
        method: 'PUT',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось обновить тип помещения')
    }
  }

  async function deleteRoomType(id: number): Promise<RoomTypeDeleteResult> {
    try {
      if (isMockMode.value) {
        mockDeletedIds.value = new Set([...mockDeletedIds.value, id])
        mockUpdatedItems.value.delete(id)
        mockExtraItems.value = mockExtraItems.value.filter((item) => item.id !== id)

        return { ok: true }
      }

      await api(API_PATHS.broker.roomTypes.detail(id), {
        method: 'DELETE',
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить тип помещения',
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
    createRoomType,
    updateRoomType,
    deleteRoomType,
  }
}
