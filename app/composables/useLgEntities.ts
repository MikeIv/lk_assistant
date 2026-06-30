import { API_PATHS } from '#shared/constants/api'
import { LEGAL_ENTITIES_MOCK_ITEMS } from '#shared/constants/legalEntitiesMock'
import type {
  LegalEntitiesListApiResponse,
  LegalEntitiesPagination,
  LegalEntity,
  LegalEntityCreateApiResponse,
  LegalEntityCreatePayload,
  LegalEntityCreateResult,
  LegalEntityDeleteResult,
  LegalEntitySortDirection,
  LegalEntitySortKey,
} from '#shared/types/legalEntities'
import { normalizeLegalEntity } from '#shared/utils/legalEntitiesNormalize'
import { buildLegalEntitiesQueryParams } from '#shared/utils/legalEntitiesQuery'
import {
  buildLegalEntitiesPagination,
  LEGAL_ENTITIES_DEFAULT_PER_PAGE,
  LEGAL_ENTITIES_DEFAULT_SORT_DIRECTION,
  LEGAL_ENTITIES_DEFAULT_SORT_KEY,
  matchesLegalEntitySearch,
  paginateLegalEntities,
  sortLegalEntities,
  toLegalEntitiesApiPagination,
} from '#shared/utils/legalEntitiesTable'
import {
  emptyLegalEntityCreateFieldErrors,
  findLegalEntityDuplicateErrors,
  hasLegalEntityCreateFieldErrors,
  normalizeLegalEntityCreatePayload,
  parseLegalEntityCreateFieldErrors,
  validateLegalEntityFormPayload,
} from '#shared/utils/legalEntitiesValidation'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

const SEARCH_DEBOUNCE_MS = 300

/** Список юр. лиц: API `brokerLegalEntity.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function useLgEntities() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiResponse = ref<LegalEntitiesListApiResponse | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<LegalEntity[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, LegalEntity>>(new Map())

  const mockSourceItems = computed<LegalEntity[]>(() => [
    ...LEGAL_ENTITIES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
      (item) => mockUpdatedItems.value.get(item.id) ?? item,
    ),
    ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
  ])

  const searchQuery = ref('')
  const sortKey = ref<LegalEntitySortKey>(LEGAL_ENTITIES_DEFAULT_SORT_KEY)
  const sortDirection = ref<LegalEntitySortDirection>(LEGAL_ENTITIES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(LEGAL_ENTITIES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const mockSortedItems = computed<LegalEntity[]>(() => {
    if (!isMockMode.value) {
      return []
    }

    const query = searchQuery.value.trim()
    const filtered = query
      ? mockSourceItems.value.filter((item) => matchesLegalEntitySearch(item, query))
      : mockSourceItems.value

    return sortLegalEntities(filtered, sortKey.value, sortDirection.value)
  })

  const mockPagination = computed<LegalEntitiesPagination>(() =>
    isMockMode.value
      ? buildLegalEntitiesPagination(mockSortedItems.value.length, currentPage.value, perPage.value)
      : buildLegalEntitiesPagination(0, 1, perPage.value),
  )

  const mockItems = computed<LegalEntity[]>(() =>
    isMockMode.value
      ? paginateLegalEntities(mockSortedItems.value, currentPage.value, perPage.value)
      : [],
  )

  const apiPagination = computed<LegalEntitiesPagination>(() => {
    const payload = apiResponse.value?.payload

    return payload
      ? toLegalEntitiesApiPagination(payload)
      : buildLegalEntitiesPagination(0, 1, perPage.value)
  })

  const pagination = computed<LegalEntitiesPagination>(() =>
    isMockMode.value ? mockPagination.value : apiPagination.value,
  )

  const items = computed<LegalEntity[]>(() => {
    if (isMockMode.value) {
      return mockItems.value
    }

    return (apiResponse.value?.payload.data ?? []).map(normalizeLegalEntity)
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

      const query = buildLegalEntitiesQueryParams({
        page,
        perPage: perPage.value,
        search: searchQuery.value,
        sortKey: sortKey.value,
        sortDirection: sortDirection.value,
      })

      apiResponse.value = await api<LegalEntitiesListApiResponse>(
        `${API_PATHS.broker.legalEntities.list}?${query}`,
      )
      currentPage.value = apiResponse.value.payload.current_page
    } catch {
      error.value = 'Не удалось загрузить список юридических лиц'
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

  function toggleSort(key: LegalEntitySortKey) {
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

  function validationFailure(fieldErrors: LegalEntityCreateFieldErrors): LegalEntityCreateResult {
    return { ok: false, fieldErrors, generalError: null }
  }

  function mutationFailure(cause: unknown, fallbackMessage: string): LegalEntityCreateResult {
    const fetchError = cause as FetchError<unknown>
    const status = fetchError.response?.status ?? fetchError.statusCode

    if (status === 422) {
      const fieldErrors = parseLegalEntityCreateFieldErrors(fetchError.data)

      return {
        ok: false,
        fieldErrors,
        generalError: hasLegalEntityCreateFieldErrors(fieldErrors) ? null : fallbackMessage,
      }
    }

    return {
      ok: false,
      fieldErrors: emptyLegalEntityCreateFieldErrors(),
      generalError: fallbackMessage,
    }
  }

  async function createLegalEntity(
    payload: LegalEntityCreatePayload,
  ): Promise<LegalEntityCreateResult> {
    const normalizedPayload = normalizeLegalEntityCreatePayload(payload)

    const clientFieldErrors = validateLegalEntityFormPayload(normalizedPayload)
    if (hasLegalEntityCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findLegalEntityDuplicateErrors(
          mockSourceItems.value,
          normalizedPayload,
        )

        if (hasLegalEntityCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        mockExtraItems.value.push({
          id: LEGAL_ENTITIES_MOCK_ITEMS.length + mockExtraItems.value.length + 1,
          legal_entity: normalizedPayload.legal_entity,
          inn: normalizedPayload.inn,
          kpp: normalizedPayload.kpp,
        })

        return { ok: true }
      }

      await api<LegalEntityCreateApiResponse>(API_PATHS.broker.legalEntities.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось создать юридическое лицо')
    }
  }

  async function updateLegalEntity(
    id: number,
    payload: LegalEntityCreatePayload,
  ): Promise<LegalEntityCreateResult> {
    const normalizedPayload = normalizeLegalEntityCreatePayload(payload)

    const clientFieldErrors = validateLegalEntityFormPayload(normalizedPayload)
    if (hasLegalEntityCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findLegalEntityDuplicateErrors(
          mockSourceItems.value,
          normalizedPayload,
          id,
        )

        if (hasLegalEntityCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        const updatedEntity: LegalEntity = {
          id,
          legal_entity: normalizedPayload.legal_entity,
          inn: normalizedPayload.inn,
          kpp: normalizedPayload.kpp,
        }

        const extraIndex = mockExtraItems.value.findIndex((item) => item.id === id)
        if (extraIndex >= 0) {
          mockExtraItems.value.splice(extraIndex, 1, updatedEntity)
        } else {
          mockUpdatedItems.value.set(id, updatedEntity)
        }

        return { ok: true }
      }

      await api<LegalEntityCreateApiResponse>(API_PATHS.broker.legalEntities.detail(id), {
        method: 'PUT',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось обновить юридическое лицо')
    }
  }

  async function deleteLegalEntity(id: number): Promise<LegalEntityDeleteResult> {
    try {
      if (isMockMode.value) {
        mockDeletedIds.value = new Set([...mockDeletedIds.value, id])
        mockUpdatedItems.value.delete(id)
        mockExtraItems.value = mockExtraItems.value.filter((item) => item.id !== id)

        return { ok: true }
      }

      await api(API_PATHS.broker.legalEntities.detail(id), {
        method: 'DELETE',
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить юридическое лицо',
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
    createLegalEntity,
    updateLegalEntity,
    deleteLegalEntity,
  }
}
