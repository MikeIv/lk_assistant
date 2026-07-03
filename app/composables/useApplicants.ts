import { API_PATHS } from '#shared/constants/api'
import { APPLICANTS_MOCK_ITEMS } from '#shared/constants/applicantsMock'
import { CATEGORIES_MOCK_ITEMS } from '#shared/constants/categoriesMock'
import { LEGAL_ENTITIES_MOCK_ITEMS } from '#shared/constants/legalEntitiesMock'
import type {
  Applicant,
  ApplicantCreateFieldErrors,
  ApplicantCreatePayload,
  ApplicantCreateResult,
  ApplicantDeleteResult,
  ApplicantsListApiResponse,
  ApplicantsPagination,
  ApplicantMutationApiResponse,
  ApplicantSortDirection,
  ApplicantSortKey,
} from '#shared/types/applicants'
import type { CategoriesListApiResponse, Category } from '#shared/types/categories'
import type { LegalEntitiesListApiResponse, LegalEntity } from '#shared/types/legalEntities'
import { normalizeApplicant } from '#shared/utils/applicantsNormalize'
import { buildApplicantsQueryParams } from '#shared/utils/applicantsQuery'
import {
  APPLICANTS_DEFAULT_PER_PAGE,
  APPLICANTS_DEFAULT_SORT_DIRECTION,
  APPLICANTS_DEFAULT_SORT_KEY,
  buildApplicantsPagination,
  matchesApplicantSearch,
  paginateApplicants,
  sortApplicants,
  toApplicantsApiPagination,
} from '#shared/utils/applicantsTable'
import {
  emptyApplicantCreateFieldErrors,
  hasApplicantCreateFieldErrors,
  normalizeApplicantCreatePayload,
  parseApplicantCreateFieldErrors,
  validateApplicantFormPayload,
} from '#shared/utils/applicantsValidation'
import { normalizeCategory } from '#shared/utils/categoriesNormalize'
import { buildLegalEntitiesQueryParams } from '#shared/utils/legalEntitiesQuery'
import { normalizeLegalEntity } from '#shared/utils/legalEntitiesNormalize'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

const SEARCH_DEBOUNCE_MS = 300
const LEGAL_ENTITIES_OPTIONS_PER_PAGE = 1000

/** Список претендентов: API `brokerTenantApplicant.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function useApplicants() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiResponse = ref<ApplicantsListApiResponse | null>(null)
  const categories = ref<Category[]>([])
  const legalEntities = ref<LegalEntity[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<Applicant[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, Applicant>>(new Map())

  const mockSourceItems = computed<Applicant[]>(() => [
    ...APPLICANTS_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
      (item) => mockUpdatedItems.value.get(item.id) ?? item,
    ),
    ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
  ])

  const searchQuery = ref('')
  const sortKey = ref<ApplicantSortKey>(APPLICANTS_DEFAULT_SORT_KEY)
  const sortDirection = ref<ApplicantSortDirection>(APPLICANTS_DEFAULT_SORT_DIRECTION)
  const perPage = ref(APPLICANTS_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const mockSortedItems = computed<Applicant[]>(() => {
    if (!isMockMode.value) {
      return []
    }

    const query = searchQuery.value.trim()
    const filtered = query
      ? mockSourceItems.value.filter((item) => matchesApplicantSearch(item, query))
      : mockSourceItems.value

    return sortApplicants(filtered, sortKey.value, sortDirection.value)
  })

  const mockPagination = computed<ApplicantsPagination>(() =>
    isMockMode.value
      ? buildApplicantsPagination(mockSortedItems.value.length, currentPage.value, perPage.value)
      : buildApplicantsPagination(0, 1, perPage.value),
  )

  const mockItems = computed<Applicant[]>(() =>
    isMockMode.value
      ? paginateApplicants(mockSortedItems.value, currentPage.value, perPage.value)
      : [],
  )

  const apiPagination = computed<ApplicantsPagination>(() => {
    const payload = apiResponse.value?.payload

    return payload
      ? toApplicantsApiPagination(payload)
      : buildApplicantsPagination(0, 1, perPage.value)
  })

  const pagination = computed<ApplicantsPagination>(() =>
    isMockMode.value ? mockPagination.value : apiPagination.value,
  )

  const items = computed<Applicant[]>(() => {
    if (isMockMode.value) {
      return mockItems.value
    }

    return (apiResponse.value?.payload.data ?? []).map(normalizeApplicant)
  })

  watch(
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

  function resolveCategoryName(categoryId: number): string | null {
    return categories.value.find((item) => item.id === categoryId)?.name ?? null
  }

  function resolveLegalEntities(legalEntityIds: number[] | null): Applicant['legal_entities'] {
    if (!legalEntityIds?.length) {
      return []
    }

    const entitiesById = new Map(legalEntities.value.map((item) => [item.id, item]))

    return legalEntityIds
      .map((id) => entitiesById.get(id))
      .filter((item): item is LegalEntity => Boolean(item))
      .map((item) => ({
        id: item.id,
        legal_entity: item.legal_entity,
        inn: item.inn,
        kpp: item.kpp,
      }))
  }

  function nextMockApplicantId(): number {
    const ids = mockSourceItems.value.map((item) => item.id)

    return (ids.length ? Math.max(...ids) : 0) + 1
  }

  async function fetchReferenceData() {
    try {
      if (isMockMode.value) {
        categories.value = [...CATEGORIES_MOCK_ITEMS]
        legalEntities.value = [...LEGAL_ENTITIES_MOCK_ITEMS]
        return
      }

      const [categoriesResponse, legalEntitiesResponse] = await Promise.all([
        api<CategoriesListApiResponse>(API_PATHS.broker.categories.list),
        api<LegalEntitiesListApiResponse>(
          `${API_PATHS.broker.legalEntities.list}?${buildLegalEntitiesQueryParams({
            page: 1,
            perPage: LEGAL_ENTITIES_OPTIONS_PER_PAGE,
            search: '',
            sortKey: 'id',
            sortDirection: 'asc',
          })}`,
        ),
      ])

      categories.value = (categoriesResponse.payload.items ?? []).map(normalizeCategory)
      legalEntities.value = (legalEntitiesResponse.payload.data ?? []).map(normalizeLegalEntity)
    } catch {
      categories.value = []
      legalEntities.value = []
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

      const query = buildApplicantsQueryParams({
        page,
        perPage: perPage.value,
        search: searchQuery.value,
        sortKey: sortKey.value,
        sortDirection: sortDirection.value,
      })

      apiResponse.value = await api<ApplicantsListApiResponse>(
        `${API_PATHS.broker.tenantApplicants.list}?${query}`,
      )
      currentPage.value = apiResponse.value.payload.current_page
    } catch {
      error.value = 'Не удалось загрузить список претендентов'
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

  function toggleSort(key: ApplicantSortKey) {
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
    void fetchReferenceData()
    void fetchItems()
  })

  onUnmounted(() => {
    clearTimeout(searchDebounceTimer)
  })

  function validationFailure(fieldErrors: ApplicantCreateFieldErrors): ApplicantCreateResult {
    return { ok: false, fieldErrors, generalError: null }
  }

  function mutationFailure(cause: unknown, fallbackMessage: string): ApplicantCreateResult {
    const fetchError = cause as FetchError<unknown>
    const status = fetchError.response?.status ?? fetchError.statusCode

    if (status === 422) {
      const fieldErrors = parseApplicantCreateFieldErrors(fetchError.data)

      return {
        ok: false,
        fieldErrors,
        generalError: hasApplicantCreateFieldErrors(fieldErrors) ? null : fallbackMessage,
      }
    }

    return {
      ok: false,
      fieldErrors: emptyApplicantCreateFieldErrors(),
      generalError: fallbackMessage,
    }
  }

  function buildApplicantFromPayload(payload: ApplicantCreatePayload, id: number): Applicant {
    return {
      id,
      title: payload.title,
      company_group: payload.company_group,
      category_id: payload.category_id,
      category_name: resolveCategoryName(payload.category_id),
      legal_entities: resolveLegalEntities(payload.legal_entity_ids),
      contacts: payload.contacts ?? [],
    }
  }

  async function createApplicant(payload: ApplicantCreatePayload): Promise<ApplicantCreateResult> {
    const normalizedPayload = normalizeApplicantCreatePayload(payload)

    const clientFieldErrors = validateApplicantFormPayload(normalizedPayload)
    if (hasApplicantCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        mockExtraItems.value.push(
          buildApplicantFromPayload(normalizedPayload, nextMockApplicantId()),
        )

        return { ok: true }
      }

      await api<ApplicantMutationApiResponse>(API_PATHS.broker.tenantApplicants.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось создать претендента')
    }
  }

  async function updateApplicant(
    id: number,
    payload: ApplicantCreatePayload,
  ): Promise<ApplicantCreateResult> {
    const normalizedPayload = normalizeApplicantCreatePayload(payload)

    const clientFieldErrors = validateApplicantFormPayload(normalizedPayload)
    if (hasApplicantCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const updatedApplicant = buildApplicantFromPayload(normalizedPayload, id)
        const extraIndex = mockExtraItems.value.findIndex((item) => item.id === id)

        if (extraIndex >= 0) {
          mockExtraItems.value.splice(extraIndex, 1, updatedApplicant)
        } else {
          mockUpdatedItems.value.set(id, updatedApplicant)
        }

        return { ok: true }
      }

      await api<ApplicantMutationApiResponse>(API_PATHS.broker.tenantApplicants.detail(id), {
        method: 'PUT',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось обновить претендента')
    }
  }

  async function deleteApplicant(id: number): Promise<ApplicantDeleteResult> {
    try {
      if (isMockMode.value) {
        mockDeletedIds.value = new Set([...mockDeletedIds.value, id])
        mockUpdatedItems.value.delete(id)
        mockExtraItems.value = mockExtraItems.value.filter((item) => item.id !== id)

        return { ok: true }
      }

      await api(API_PATHS.broker.tenantApplicants.detail(id), {
        method: 'DELETE',
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить претендента',
      }
    }
  }

  return {
    items,
    categories,
    legalEntities,
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
    createApplicant,
    updateApplicant,
    deleteApplicant,
  }
}
