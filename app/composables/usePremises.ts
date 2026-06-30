import { API_PATHS } from '#shared/constants/api'
import { PREMISES_MOCK_ITEMS, ROOM_TYPES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import type {
  Premise,
  PremiseCreateFieldErrors,
  PremiseCreatePayload,
  PremiseCreateResult,
  PremiseDeleteResult,
  PremiseMutationApiResponse,
  PremisesListApiResponse,
  PremiseSortDirection,
  PremiseSortKey,
  RoomType,
  RoomTypesListApiResponse,
} from '#shared/types/premises'
import { normalizePremise, normalizeRoomType } from '#shared/utils/premisesNormalize'
import {
  buildPremisesPagination,
  matchesPremiseSearch,
  paginatePremises,
  PREMISES_DEFAULT_PER_PAGE,
  PREMISES_DEFAULT_SORT_DIRECTION,
  PREMISES_DEFAULT_SORT_KEY,
  sortPremises,
} from '#shared/utils/premisesTable'
import {
  emptyPremiseCreateFieldErrors,
  hasPremiseCreateFieldErrors,
  normalizePremiseCreatePayload,
  parsePremiseCreateFieldErrors,
  validatePremiseFormPayload,
} from '#shared/utils/premisesValidation'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

/** Список помещений: API `brokerRoom.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function usePremises() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiSourceItems = ref<Premise[]>([])
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

  const sourceItems = computed<Premise[]>(() =>
    isMockMode.value ? mockSourceItems.value : apiSourceItems.value,
  )

  const searchQuery = ref('')
  const sortKey = ref<PremiseSortKey>(PREMISES_DEFAULT_SORT_KEY)
  const sortDirection = ref<PremiseSortDirection>(PREMISES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(PREMISES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const filteredItems = computed<Premise[]>(() => {
    const query = searchQuery.value.trim()
    const filtered = query
      ? sourceItems.value.filter((item) => matchesPremiseSearch(item, query))
      : sourceItems.value

    return sortPremises(filtered, sortKey.value, sortDirection.value)
  })

  const pagination = computed(() =>
    buildPremisesPagination(filteredItems.value.length, currentPage.value, perPage.value),
  )

  const items = computed<Premise[]>(() =>
    paginatePremises(filteredItems.value, pagination.value.currentPage, pagination.value.perPage),
  )

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

      const response = await api<RoomTypesListApiResponse>(API_PATHS.broker.roomTypes.list)
      roomTypes.value = (response.payload.items ?? []).map(normalizeRoomType)
    } catch {
      roomTypes.value = []
    }
  }

  async function fetchItems(options?: { silent?: boolean }) {
    if (!options?.silent) {
      isLoading.value = true
    }
    error.value = null

    try {
      if (isMockMode.value) {
        return
      }

      const response = await api<PremisesListApiResponse>(API_PATHS.broker.rooms.list)
      apiSourceItems.value = (response.payload.items ?? []).map(normalizePremise)
    } catch {
      error.value = 'Не удалось загрузить список помещений'
      apiSourceItems.value = []
    } finally {
      if (!options?.silent) {
        isLoading.value = false
      }
    }
  }

  async function refresh() {
    isLoading.value = true
    error.value = null

    await Promise.all([fetchItems({ silent: true }), fetchRoomTypes()])

    isLoading.value = false
  }

  function setPage(page: number) {
    currentPage.value = Math.max(1, Math.min(page, pagination.value.lastPage))
  }

  function setPerPage(value: number) {
    perPage.value = value
    currentPage.value = 1
  }

  function toggleSort(key: PremiseSortKey) {
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

  async function reloadAfterMutation() {
    if (isMockMode.value) {
      return
    }

    await fetchItems({ silent: true })
  }

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

      await reloadAfterMutation()

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

      await reloadAfterMutation()

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

      await reloadAfterMutation()

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить помещение',
      }
    }
  }

  onMounted(() => {
    void refresh()
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
