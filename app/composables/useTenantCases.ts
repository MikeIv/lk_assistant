import { API_PATHS } from '#shared/constants/api'
import { APPLICANTS_MOCK_ITEMS } from '#shared/constants/applicantsMock'
import { PREMISES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import { TENANT_CASES_MOCK_ITEMS } from '#shared/constants/tenantCasesMock'
import type {
  TenantCase,
  TenantCaseCreatePayload,
  TenantCaseDeleteResult,
  TenantCaseMutationApiResponse,
  TenantCaseMutationResult,
  TenantCaseShowApiResponse,
  TenantCaseSortDirection,
  TenantCaseSortKey,
  TenantCaseStorePayload,
  TenantCaseUpdatePayload,
  TenantCasesListApiResponse,
  TenantCasesPagination,
} from '#shared/types/tenantCases'
import {
  buildTenantCaseTableRows,
  normalizeTenantCase,
  normalizeTenantCaseApplicantPayload,
} from '#shared/utils/tenantCasesNormalize'
import { buildTenantCasesQueryParams } from '#shared/utils/tenantCasesQuery'
import {
  buildTenantCasesPagination,
  matchesTenantCaseSearch,
  paginateTenantCases,
  sortTenantCases,
  TENANT_CASES_DEFAULT_PER_PAGE,
  TENANT_CASES_DEFAULT_SORT_DIRECTION,
  TENANT_CASES_DEFAULT_SORT_KEY,
  toTenantCasesApiPagination,
} from '#shared/utils/tenantCasesTable'
import {
  emptyTenantCaseCreateFieldErrors,
  hasTenantCaseCreateFieldErrors,
  normalizeTenantCaseCreatePayload,
  normalizeTenantCaseStorePayload,
  parseTenantCaseCreateFieldErrors,
  storePayloadToCreatePayload,
  validateTenantCaseFormPayload,
} from '#shared/utils/tenantCasesValidation'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

const SEARCH_DEBOUNCE_MS = 300

function buildMockTenantCaseFromPayload(id: number, payload: TenantCaseCreatePayload): TenantCase {
  const premise =
    PREMISES_MOCK_ITEMS.find((item) => item.id === payload.room_id) ?? PREMISES_MOCK_ITEMS[0]!
  const room = {
    id: String(premise.id),
    category: premise.room_type ?? '',
    floor: premise.floor ?? '',
    name: premise.name,
    area: premise.area,
  }

  const applicants = payload.applicants.map((applicantPayload, index) => {
    const applicantRecord = APPLICANTS_MOCK_ITEMS.find(
      (item) => item.id === applicantPayload.tenant_applicant_id,
    )
    const contact = applicantRecord?.contacts[0]

    return {
      id: applicantPayload.id ?? id * 100 + index + 1,
      tenant_applicant_id: applicantPayload.tenant_applicant_id,
      tenant_applicant:
        applicantRecord?.title ?? `Претендент ${applicantPayload.tenant_applicant_id}`,
      category: applicantRecord?.category_name ?? '—',
      status: applicantPayload.status,
      first_contact_date: applicantPayload.first_contact_date,
      next_contact_date: applicantPayload.next_contact_date,
      negotiations: applicantPayload.negotiations ?? [],
      contacts: [contact?.name, contact?.phone_number, contact?.email].filter(Boolean).join(', '),
    }
  })

  const tenantCase: TenantCase = {
    id,
    room_id: payload.room_id,
    room,
    current_tenant: `Арендатор ${premise.name}`,
    responsible: payload.responsible_name,
    applicants,
    table_rows: [],
    kp: { rows: [] },
  }

  tenantCase.table_rows = buildTenantCaseTableRows(
    id,
    room,
    tenantCase.current_tenant,
    tenantCase.responsible,
    applicants,
  )

  return tenantCase
}

/** Список и CRUD карточек дел: API `brokerTenantCase.*` или mock без `NUXT_PUBLIC_API_BASE`. */
export function useTenantCases() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiResponse = ref<TenantCasesListApiResponse | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = useState<TenantCase[]>('tenant-cases:mock-extra', () => [])
  const mockDeletedIds = useState<number[]>('tenant-cases:mock-deleted', () => [])
  const mockUpdatedItems = useState<Record<number, TenantCase>>(
    'tenant-cases:mock-updated',
    () => ({}),
  )

  const mockDeletedIdSet = computed(() => new Set(mockDeletedIds.value))

  const mockSourceItems = computed<TenantCase[]>(() => [
    ...TENANT_CASES_MOCK_ITEMS.filter((item) => !mockDeletedIdSet.value.has(item.id)).map(
      (item) => mockUpdatedItems.value[item.id] ?? item,
    ),
    ...mockExtraItems.value.filter((item) => !mockDeletedIdSet.value.has(item.id)),
  ])

  const searchQuery = ref('')
  const sortKey = ref<TenantCaseSortKey>(TENANT_CASES_DEFAULT_SORT_KEY)
  const sortDirection = ref<TenantCaseSortDirection>(TENANT_CASES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(TENANT_CASES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const mockSortedItems = computed<TenantCase[]>(() => {
    if (!isMockMode.value) {
      return []
    }

    const query = searchQuery.value.trim()
    const filtered = query
      ? mockSourceItems.value.filter((item) => matchesTenantCaseSearch(item, query))
      : mockSourceItems.value

    return sortTenantCases(filtered, sortKey.value, sortDirection.value)
  })

  const mockPagination = computed<TenantCasesPagination>(() =>
    isMockMode.value
      ? buildTenantCasesPagination(mockSortedItems.value.length, currentPage.value, perPage.value)
      : buildTenantCasesPagination(0, 1, perPage.value),
  )

  const mockItems = computed<TenantCase[]>(() =>
    isMockMode.value
      ? paginateTenantCases(mockSortedItems.value, currentPage.value, perPage.value)
      : [],
  )

  const apiPagination = computed<TenantCasesPagination>(() => {
    const payload = apiResponse.value?.payload

    return payload
      ? toTenantCasesApiPagination(payload)
      : buildTenantCasesPagination(0, 1, perPage.value)
  })

  const pagination = computed<TenantCasesPagination>(() =>
    isMockMode.value ? mockPagination.value : apiPagination.value,
  )

  const items = computed<TenantCase[]>(() => {
    if (isMockMode.value) {
      return mockItems.value
    }

    return (apiResponse.value?.payload.data ?? []).map(normalizeTenantCase)
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

      const query = buildTenantCasesQueryParams({
        page,
        perPage: perPage.value,
        search: searchQuery.value,
        sortKey: sortKey.value,
        sortDirection: sortDirection.value,
      })

      apiResponse.value = await api<TenantCasesListApiResponse>(
        `${API_PATHS.broker.tenantCases.list}?${query}`,
      )
      currentPage.value = apiResponse.value.payload.current_page
    } catch {
      error.value = 'Не удалось загрузить список текущих дел'
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

  function toggleSort(key: TenantCaseSortKey) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = key === 'number' ? 'desc' : 'asc'
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
    fieldErrors: ReturnType<typeof emptyTenantCaseCreateFieldErrors>,
  ): TenantCaseMutationResult {
    return { ok: false, fieldErrors, generalError: null }
  }

  function mutationFailure(cause: unknown, fallbackMessage: string): TenantCaseMutationResult {
    const fetchError = cause as FetchError<unknown>
    const status = fetchError.response?.status ?? fetchError.statusCode

    if (status === 422) {
      const fieldErrors = parseTenantCaseCreateFieldErrors(fetchError.data)

      return {
        ok: false,
        fieldErrors,
        generalError: hasTenantCaseCreateFieldErrors(fieldErrors) ? null : fallbackMessage,
      }
    }

    return {
      ok: false,
      fieldErrors: emptyTenantCaseCreateFieldErrors(),
      generalError: fallbackMessage,
    }
  }

  async function fetchTenantCase(id: number): Promise<TenantCase | null> {
    try {
      if (isMockMode.value) {
        const item =
          mockSourceItems.value.find((tenantCase) => tenantCase.id === id) ??
          mockExtraItems.value.find((tenantCase) => tenantCase.id === id)

        return item ? { ...item } : null
      }

      const response = await api<TenantCaseShowApiResponse>(API_PATHS.broker.tenantCases.detail(id))

      return normalizeTenantCase(response.payload)
    } catch {
      return null
    }
  }

  async function createTenantCase(
    payload: TenantCaseStorePayload,
  ): Promise<TenantCaseMutationResult> {
    const normalizedPayload = normalizeTenantCaseStorePayload(payload)

    try {
      if (isMockMode.value) {
        const formPayload = storePayloadToCreatePayload(normalizedPayload)
        const normalizedFormPayload = normalizeTenantCaseCreatePayload(formPayload)
        const nextId =
          Math.max(
            0,
            ...mockSourceItems.value.map((item) => item.id),
            ...mockExtraItems.value.map((item) => item.id),
          ) + 1

        mockExtraItems.value = [
          ...mockExtraItems.value,
          buildMockTenantCaseFromPayload(nextId, normalizedFormPayload),
        ]

        return { ok: true }
      }

      await api<TenantCaseMutationApiResponse>(API_PATHS.broker.tenantCases.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      void fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось создать карточку дела')
    }
  }

  async function updateTenantCase(
    id: number,
    payload: TenantCaseUpdatePayload,
  ): Promise<TenantCaseMutationResult> {
    const normalizedPayload = normalizeTenantCaseCreatePayload({
      ...payload,
      applicants: payload.applicants.map(normalizeTenantCaseApplicantPayload),
    })

    const clientFieldErrors = validateTenantCaseFormPayload(normalizedPayload)
    if (hasTenantCaseCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const updatedCase = buildMockTenantCaseFromPayload(id, normalizedPayload)

        const extraIndex = mockExtraItems.value.findIndex((item) => item.id === id)
        if (extraIndex >= 0) {
          const nextItems = [...mockExtraItems.value]
          nextItems.splice(extraIndex, 1, updatedCase)
          mockExtraItems.value = nextItems
        } else {
          mockUpdatedItems.value = {
            ...mockUpdatedItems.value,
            [id]: updatedCase,
          }
        }

        return { ok: true }
      }

      await api<TenantCaseMutationApiResponse>(API_PATHS.broker.tenantCases.detail(id), {
        method: 'PUT',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось обновить карточку дела')
    }
  }

  async function deleteTenantCase(id: number): Promise<TenantCaseDeleteResult> {
    try {
      if (isMockMode.value) {
        mockDeletedIds.value = [...mockDeletedIds.value, id]
        mockUpdatedItems.value = Object.fromEntries(
          Object.entries(mockUpdatedItems.value).filter(([key]) => Number(key) !== id),
        )
        mockExtraItems.value = mockExtraItems.value.filter((item) => item.id !== id)

        return { ok: true }
      }

      await api(API_PATHS.broker.tenantCases.detail(id), {
        method: 'DELETE',
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить карточку дела',
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
    fetchTenantCase,
    createTenantCase,
    updateTenantCase,
    deleteTenantCase,
  }
}
