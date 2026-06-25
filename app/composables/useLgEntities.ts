import { API_PATHS } from '#shared/constants/api'
import { LEGAL_ENTITIES_MOCK_ITEMS } from '#shared/constants/legalEntitiesMock'
import type {
  LegalEntitiesListApiResponse,
  LegalEntitiesPagination,
  LegalEntity,
  LegalEntitySortDirection,
  LegalEntitySortKey,
} from '#shared/types/legalEntities'
import { normalizeLegalEntity } from '#shared/utils/legalEntitiesNormalize'
import {
  buildLegalEntitiesPagination,
  LEGAL_ENTITIES_DEFAULT_PER_PAGE,
  LEGAL_ENTITIES_DEFAULT_SORT_DIRECTION,
  LEGAL_ENTITIES_DEFAULT_SORT_KEY,
  matchesLegalEntitySearch,
  paginateLegalEntities,
  sortLegalEntities,
} from '#shared/utils/legalEntitiesTable'
import { useApiConfig } from '~/composables/useApiConfig'

/** Список юр. лиц: API `legalEntity.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function useLgEntities() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const allItems = ref<LegalEntity[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const searchQuery = ref('')
  const sortKey = ref<LegalEntitySortKey>(LEGAL_ENTITIES_DEFAULT_SORT_KEY)
  const sortDirection = ref<LegalEntitySortDirection>(LEGAL_ENTITIES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(LEGAL_ENTITIES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const filteredItems = computed(() => {
    const query = searchQuery.value.trim()

    if (!query) {
      return allItems.value
    }

    return allItems.value.filter((item) => matchesLegalEntitySearch(item, query))
  })

  const sortedItems = computed(() =>
    sortLegalEntities(filteredItems.value, sortKey.value, sortDirection.value),
  )

  const pagination = computed<LegalEntitiesPagination>(() =>
    buildLegalEntitiesPagination(sortedItems.value.length, currentPage.value, perPage.value),
  )

  const items = computed<LegalEntity[]>(() =>
    paginateLegalEntities(
      sortedItems.value,
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

  watch(searchQuery, () => {
    currentPage.value = 1
  })

  async function fetchItems() {
    isLoading.value = true
    error.value = null

    try {
      if (isMockMode.value) {
        allItems.value = LEGAL_ENTITIES_MOCK_ITEMS
        return
      }

      const response = await api<LegalEntitiesListApiResponse>(
        API_PATHS.dictionary.legalEntities.list,
      )
      allItems.value = response.payload.items.map(normalizeLegalEntity)
    } catch {
      error.value = 'Не удалось загрузить список юридических лиц'
      allItems.value = []
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

  function toggleSort(key: LegalEntitySortKey) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      return
    }

    sortKey.value = key
    sortDirection.value = key === 'id' ? 'desc' : 'asc'
    currentPage.value = 1
  }

  onMounted(() => {
    void fetchItems()
  })

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
    refresh: fetchItems,
  }
}
