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
  RoomTypeSortDirection,
  RoomTypeSortKey,
} from '#shared/types/roomTypes'
import { normalizeRoomType } from '#shared/utils/roomTypesNormalize'
import {
  buildRoomTypesPagination,
  matchesRoomTypeSearch,
  paginateRoomTypes,
  ROOM_TYPES_DEFAULT_PER_PAGE,
  ROOM_TYPES_DEFAULT_SORT_DIRECTION,
  ROOM_TYPES_DEFAULT_SORT_KEY,
  sortRoomTypes,
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

/** Список типов помещений: API `brokerRoomType.index` (client-side filter/sort/page) или mock. */
export function useRoomTypes() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const sourceItems = ref<RoomType[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<RoomType[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, RoomType>>(new Map())

  const allItems = computed<RoomType[]>(() => {
    if (isMockMode.value) {
      return [
        ...ROOM_TYPES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
          (item) => mockUpdatedItems.value.get(item.id) ?? item,
        ),
        ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
      ]
    }

    return sourceItems.value
  })

  const searchQuery = ref('')
  const sortKey = ref<RoomTypeSortKey>(ROOM_TYPES_DEFAULT_SORT_KEY)
  const sortDirection = ref<RoomTypeSortDirection>(ROOM_TYPES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(ROOM_TYPES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const filteredItems = computed<RoomType[]>(() => {
    const query = searchQuery.value.trim()
    const filtered = query
      ? allItems.value.filter((item) => matchesRoomTypeSearch(item, query))
      : allItems.value

    return sortRoomTypes(filtered, sortKey.value, sortDirection.value)
  })

  const pagination = computed(() =>
    buildRoomTypesPagination(filteredItems.value.length, currentPage.value, perPage.value),
  )

  const items = computed<RoomType[]>(() =>
    paginateRoomTypes(filteredItems.value, pagination.value.currentPage, pagination.value.perPage),
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

      const response = await api<RoomTypesListApiResponse>(API_PATHS.broker.roomTypes.list)
      sourceItems.value = response.payload.items.map(normalizeRoomType)
    } catch {
      error.value = 'Не удалось загрузить список типов помещений'
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

  function toggleSort(key: RoomTypeSortKey) {
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
        const duplicateErrors = findRoomTypeDuplicateErrors(allItems.value, normalizedPayload)

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

      await fetchItems({ silent: true })

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
        const duplicateErrors = findRoomTypeDuplicateErrors(allItems.value, normalizedPayload, id)

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

      await fetchItems({ silent: true })

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

      await fetchItems({ silent: true })

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
