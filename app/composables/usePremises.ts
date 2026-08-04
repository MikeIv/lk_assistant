import { API_PATHS } from '#shared/constants/api'
import { PREMISES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import { ROOM_TYPES_MOCK_ITEMS } from '#shared/constants/roomTypesMock'
import type {
  Premise,
  PremiseCreateFieldErrors,
  PremiseCreatePayload,
  PremiseCreateResult,
  PremiseDeleteResult,
  PremiseMutationApiResponse,
  PremisesListApiResponse,
  PremisesPagination,
  PremiseSortDirection,
  PremiseSortKey,
} from '#shared/types/premises'
import type { RoomType, RoomTypesListApiResponse } from '#shared/types/roomTypes'
import { normalizePremise } from '#shared/utils/premisesNormalize'
import { buildPremisesQueryParams } from '#shared/utils/premisesQuery'
import {
  buildPremisesPagination,
  matchesPremiseSearch,
  paginatePremises,
  PREMISES_DEFAULT_PER_PAGE,
  PREMISES_DEFAULT_SORT_DIRECTION,
  PREMISES_DEFAULT_SORT_KEY,
  sortPremises,
  toPremisesApiPagination,
} from '#shared/utils/premisesTable'
import {
  emptyPremiseCreateFieldErrors,
  hasPremiseCreateFieldErrors,
  normalizePremiseCreatePayload,
  parsePremiseCreateFieldErrors,
  validatePremiseFormPayload,
} from '#shared/utils/premisesValidation'
import { normalizeRoomType } from '#shared/utils/roomTypesNormalize'
import { buildRoomTypesQueryParams } from '#shared/utils/roomTypesQuery'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

const SEARCH_DEBOUNCE_MS = 300
const ROOM_TYPES_OPTIONS_PER_PAGE = 1000

/** Список помещений: API `brokerRoom.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function usePremises() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiResponse = ref<PremisesListApiResponse | null>(null)
  const roomTypes = ref<RoomType[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<Premise[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, Premise>>(new Map())

  const mockSourceItems = computed<Premise[]>(() => [
    ...PREMISES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
      (item) => mockUpdatedItems.value.get(item.id) ?? item,
    ),
    ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
  ])

  const searchQuery = ref('')
  const sortKey = ref<PremiseSortKey>(PREMISES_DEFAULT_SORT_KEY)
  const sortDirection = ref<PremiseSortDirection>(PREMISES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(PREMISES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const mockSortedItems = computed<Premise[]>(() => {
    if (!isMockMode.value) {
      return []
    }

    const query = searchQuery.value.trim()
    const filtered = query
      ? mockSourceItems.value.filter((item) => matchesPremiseSearch(item, query))
      : mockSourceItems.value

    return sortPremises(filtered, sortKey.value, sortDirection.value)
  })

  const mockPagination = computed<PremisesPagination>(() =>
    isMockMode.value
      ? buildPremisesPagination(mockSortedItems.value.length, currentPage.value, perPage.value)
      : buildPremisesPagination(0, 1, perPage.value),
  )

  const mockItems = computed<Premise[]>(() =>
    isMockMode.value
      ? paginatePremises(mockSortedItems.value, currentPage.value, perPage.value)
      : [],
  )

  const apiPagination = computed<PremisesPagination>(() => {
    const payload = apiResponse.value?.payload

    return payload ? toPremisesApiPagination(payload) : buildPremisesPagination(0, 1, perPage.value)
  })

  const pagination = computed<PremisesPagination>(() =>
    isMockMode.value ? mockPagination.value : apiPagination.value,
  )

  const items = computed<Premise[]>(() => {
    if (isMockMode.value) {
      return mockItems.value
    }

    return (apiResponse.value?.payload.data ?? []).map(normalizePremise)
  })

  watch(
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

  function resolveRoomTypeName(roomTypeId: number): string | null {
    return roomTypes.value.find((item) => item.id === roomTypeId)?.name ?? null
  }

  function buildPremiseFromPayload(payload: PremiseCreatePayload, id: number): Premise {
    return {
      id,
      name: payload.name,
      floor: payload.floor,
      area: payload.area,
      name_bti: payload.name_bti,
      floor_bti: payload.floor_bti,
      area_bti: payload.area_bti,
      room_type_id: payload.room_type_id,
      room_type: resolveRoomTypeName(payload.room_type_id),
    }
  }

  function nextMockPremiseId(): number {
    return mockSourceItems.value.reduce((max, item) => Math.max(max, item.id), 0) + 1
  }

  async function fetchRoomTypes() {
    try {
      if (isMockMode.value) {
        roomTypes.value = [...ROOM_TYPES_MOCK_ITEMS]
        return
      }

      const response = await api<RoomTypesListApiResponse>(
        `${API_PATHS.broker.roomTypes.list}?${buildRoomTypesQueryParams({
          page: 1,
          perPage: ROOM_TYPES_OPTIONS_PER_PAGE,
          search: '',
          sortKey: 'id',
          sortDirection: 'asc',
        })}`,
      )
      roomTypes.value = (response.payload.data ?? []).map(normalizeRoomType)
    } catch {
      roomTypes.value = []
    }
  }

  async function fetchItems(page = currentPage.value, options?: { silent?: boolean }) {
    if (!options?.silent) {
      isLoading.value = true
    }
    error.value = null

    try {
      if (isMockMode.value) {
        return
      }

      const query = buildPremisesQueryParams({
        page,
        perPage: perPage.value,
        search: searchQuery.value,
        sortKey: sortKey.value,
        sortDirection: sortDirection.value,
      })

      apiResponse.value = await api<PremisesListApiResponse>(
        `${API_PATHS.broker.rooms.list}?${query}`,
      )
      currentPage.value = apiResponse.value.payload.current_page
    } catch {
      error.value = 'Не удалось загрузить список помещений'
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

  async function refresh() {
    if (isMockMode.value) {
      return
    }

    isLoading.value = true
    error.value = null

    await Promise.all([fetchItems(currentPage.value, { silent: true }), fetchRoomTypes()])

    isLoading.value = false
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

  function toggleSort(key: PremiseSortKey) {
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

  function validationFailure(fieldErrors: PremiseCreateFieldErrors): PremiseCreateResult {
    return { ok: false, fieldErrors, generalError: null }
  }

  function mutationFailure(cause: unknown, fallbackMessage: string): PremiseCreateResult {
    const fetchError = cause as FetchError<unknown>
    const status = fetchError.response?.status ?? fetchError.statusCode

    if (status === 422) {
      const fieldErrors = parsePremiseCreateFieldErrors(fetchError.data)

      return {
        ok: false,
        fieldErrors,
        generalError: hasPremiseCreateFieldErrors(fieldErrors) ? null : fallbackMessage,
      }
    }

    return {
      ok: false,
      fieldErrors: emptyPremiseCreateFieldErrors(),
      generalError: fallbackMessage,
    }
  }

  async function createPremise(payload: PremiseCreatePayload): Promise<PremiseCreateResult> {
    const normalizedPayload = normalizePremiseCreatePayload(payload)

    const clientFieldErrors = validatePremiseFormPayload(normalizedPayload)
    if (hasPremiseCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        mockExtraItems.value.push(buildPremiseFromPayload(normalizedPayload, nextMockPremiseId()))

        return { ok: true }
      }

      await api<PremiseMutationApiResponse>(API_PATHS.broker.rooms.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось создать помещение')
    }
  }

  async function updatePremise(
    id: number,
    payload: PremiseCreatePayload,
  ): Promise<PremiseCreateResult> {
    const normalizedPayload = normalizePremiseCreatePayload(payload)

    const clientFieldErrors = validatePremiseFormPayload(normalizedPayload)
    if (hasPremiseCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const updatedPremise = buildPremiseFromPayload(normalizedPayload, id)

        const extraIndex = mockExtraItems.value.findIndex((item) => item.id === id)
        if (extraIndex >= 0) {
          mockExtraItems.value.splice(extraIndex, 1, updatedPremise)
        } else {
          mockUpdatedItems.value.set(id, updatedPremise)
        }

        return { ok: true }
      }

      await api<PremiseMutationApiResponse>(API_PATHS.broker.rooms.detail(id), {
        method: 'PUT',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось обновить помещение')
    }
  }

  async function deletePremise(id: number): Promise<PremiseDeleteResult> {
    try {
      if (isMockMode.value) {
        mockDeletedIds.value = new Set([...mockDeletedIds.value, id])
        mockUpdatedItems.value.delete(id)
        mockExtraItems.value = mockExtraItems.value.filter((item) => item.id !== id)

        return { ok: true }
      }

      await api(API_PATHS.broker.rooms.detail(id), {
        method: 'DELETE',
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить помещение',
      }
    }
  }

  onMounted(() => {
    void fetchRoomTypes()
    void fetchItems()
  })

  onUnmounted(() => {
    clearTimeout(searchDebounceTimer)
  })

  return {
    items,
    roomTypes,
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
    refresh,
    createPremise,
    updatePremise,
    deletePremise,
  }
}
