import { API_PATHS } from '#shared/constants/api'
import { PREMISES_MOCK_ITEMS, ROOM_TYPES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import type {
  Premise,
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
import { useApiConfig } from '~/composables/useApiConfig'

/** Список помещений: API `brokerRoom.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function usePremises() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const sourceItems = ref<Premise[]>([])
  const roomTypes = ref<RoomType[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)

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
    paginatePremises(filteredItems.value, pagination.value.currentPage, perPage.value),
  )

  watch(
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

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
        sourceItems.value = [...PREMISES_MOCK_ITEMS]
        return
      }

      const response = await api<PremisesListApiResponse>(API_PATHS.broker.rooms.list)
      sourceItems.value = (response.payload.items ?? []).map(normalizePremise)
    } catch {
      error.value = 'Не удалось загрузить список помещений'
      sourceItems.value = []
    } finally {
      if (!options?.silent) {
        isLoading.value = false
      }
    }
  }

  async function refresh() {
    isLoading.value = true
    error.value = null

    try {
      await Promise.all([fetchItems({ silent: true }), fetchRoomTypes()])
    } catch {
      error.value = 'Не удалось загрузить список помещений'
    } finally {
      isLoading.value = false
    }
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
  }
}
