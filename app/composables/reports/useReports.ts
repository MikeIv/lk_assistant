import { REPORTS_MOCK_HEADERS, REPORTS_MOCK_ITEMS } from '#shared/constants/reportsMock'
import { normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'
import { getReportRequestHeaders } from '#shared/utils/reportsApiHeaders'
import {
  compareReportPeriods,
  matchesReportPeriodFilter,
  matchesReportStatusFilter,
} from '#shared/utils/reportsFilters'
import { normalizeReportHeaders, normalizeReportItem } from '#shared/utils/reportsNormalize'
import { buildReportsQueryParams } from '#shared/utils/reportsQuery'
import type {
  ReportApiResponse,
  ReportItem,
  ReportPeriodRange,
  ReportPeriodSort,
  ReportStatus,
  ReportsPagination,
} from '#shared/types/reports'

const DEFAULT_SORT: ReportPeriodSort = 'desc'

function toPagination(response: ReportApiResponse): ReportsPagination {
  return {
    currentPage: response.current_page,
    lastPage: response.last_page,
    perPage: response.per_page,
    total: response.total,
  }
}

/**
 * Загрузка и фильтрация отчётов: API `/tenants/reports` или локальный mock без `NUXT_PUBLIC_API_BASE`.
 */
export function useReports() {
  const api = useApi()
  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  const isMockMode = computed(() => !normalizeApiBaseUrl(config.public.apiBase))

  const apiResponse = ref<ReportApiResponse | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const isRefreshing = ref(false)

  const perPage = ref(12)
  const currentPage = ref(1)
  const sortPeriod = ref<ReportPeriodSort>(DEFAULT_SORT)
  const selectedStatuses = ref<ReportStatus[]>([])
  const periodRange = ref<ReportPeriodRange | null>(null)

  const statusFromDebtCounterFilter = computed(() => {
    const value = route.query['filters[status]']
    return typeof value === 'string' ? value : undefined
  })

  const mockFilteredItems = computed(() =>
    REPORTS_MOCK_ITEMS.filter(
      (item) =>
        matchesReportStatusFilter(item, selectedStatuses.value) &&
        matchesReportPeriodFilter(item, periodRange.value) &&
        (!statusFromDebtCounterFilter.value || item.status === statusFromDebtCounterFilter.value),
    ),
  )

  const mockSortedItems = computed(() => {
    if (sortPeriod.value === 'default') {
      return [...mockFilteredItems.value]
    }

    return [...mockFilteredItems.value].sort((a, b) => compareReportPeriods(a, b, sortPeriod.value))
  })

  const mockPagination = computed<ReportsPagination>(() => {
    const total = mockSortedItems.value.length
    const effectivePerPage =
      perPage.value >= total && total > 0 ? total : Math.max(perPage.value, 1)
    const lastPage = Math.max(1, Math.ceil(total / effectivePerPage) || 1)

    return {
      currentPage: Math.min(currentPage.value, lastPage),
      lastPage,
      perPage: effectivePerPage,
      total,
    }
  })

  watch(
    () => mockPagination.value.lastPage,
    (lastPage) => {
      if (isMockMode.value && currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

  const headers = computed(() => {
    if (isMockMode.value) {
      return REPORTS_MOCK_HEADERS
    }

    if (!apiResponse.value?.data.header) {
      return REPORTS_MOCK_HEADERS
    }

    return normalizeReportHeaders(apiResponse.value.data.header)
  })

  const reports = computed<ReportItem[]>(() => {
    if (isMockMode.value) {
      const { currentPage: page, perPage: pageSize } = mockPagination.value
      const start = (page - 1) * pageSize

      return mockSortedItems.value.slice(start, start + pageSize)
    }

    return (apiResponse.value?.data.body ?? []).map(normalizeReportItem)
  })

  const pagination = computed<ReportsPagination>(() => {
    if (isMockMode.value) {
      return mockPagination.value
    }

    if (!apiResponse.value) {
      return {
        currentPage: 1,
        lastPage: 1,
        perPage: perPage.value,
        total: 0,
      }
    }

    return toPagination(apiResponse.value)
  })

  const hasActiveFilters = computed(
    () =>
      Boolean(statusFromDebtCounterFilter.value) ||
      selectedStatuses.value.length > 0 ||
      periodRange.value !== null ||
      sortPeriod.value !== DEFAULT_SORT,
  )

  const tableLoading = computed(() => isLoading.value || isRefreshing.value)

  async function withMockRefresh(action: () => void) {
    isRefreshing.value = true
    await new Promise((resolve) => setTimeout(resolve, 120))
    action()
    isRefreshing.value = false
  }

  async function runInMockMode(action: () => void): Promise<boolean> {
    if (!isMockMode.value) {
      return false
    }

    await withMockRefresh(action)
    return true
  }

  async function runInMockModeFromFirstPage(action: () => void = () => {}): Promise<boolean> {
    return runInMockMode(() => {
      action()
      currentPage.value = 1
    })
  }

  const hasInitialized = ref(false)

  async function fetchReports(page = 1, perPageParam?: number) {
    if (isMockMode.value) {
      isLoading.value = !hasInitialized.value
      await withMockRefresh(() => {
        currentPage.value = Math.max(1, page)
      })
      hasInitialized.value = true
      isLoading.value = false
      return
    }

    const hasData = Boolean(apiResponse.value)
    isLoading.value = !hasData
    isRefreshing.value = hasData
    error.value = null

    try {
      const query = buildReportsQueryParams({
        page,
        perPage: perPageParam ?? perPage.value,
        sortPeriod: sortPeriod.value,
        selectedStatuses: selectedStatuses.value,
        periodRange: periodRange.value,
        statusFromRoute: statusFromDebtCounterFilter.value,
      })

      apiResponse.value = await api<ReportApiResponse>(`/tenants/reports?${query}`, {
        headers: getReportRequestHeaders(),
      })
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Не удалось загрузить отчёты'
    } finally {
      isLoading.value = false
      isRefreshing.value = false
    }
  }

  async function init() {
    await fetchReports(1)
  }

  async function loadPage(page: number) {
    if (
      await runInMockMode(() => {
        currentPage.value = Math.max(1, Math.min(page, mockPagination.value.lastPage))
      })
    ) {
      return
    }

    await fetchReports(page)
  }

  async function handlePerPageChange(value: number | 'all') {
    const perPageParam = value === 'all' ? 1000 : value
    perPage.value = perPageParam

    if (await runInMockModeFromFirstPage()) {
      return
    }

    await fetchReports(1, perPageParam)
  }

  async function toggleSortOrder(order: ReportPeriodSort) {
    sortPeriod.value = order

    if (await runInMockModeFromFirstPage()) {
      return
    }

    await fetchReports(pagination.value.currentPage)
  }

  async function applyStatusFilter(statuses: ReportStatus[]) {
    if (statusFromDebtCounterFilter.value) {
      await router.push({
        path: route.path,
        query: {
          ...route.query,
          'filters[status]': undefined,
        },
      })
    }

    selectedStatuses.value = statuses

    if (await runInMockModeFromFirstPage()) {
      return
    }

    await fetchReports(1)
  }

  async function applyPeriodFilter(range: { start: string; end: string } | null) {
    if (!range?.start || !range.end) {
      periodRange.value = null
    } else {
      periodRange.value = { from: range.start, to: range.end }
    }

    if (await runInMockModeFromFirstPage()) {
      return
    }

    await fetchReports(1)
  }

  async function resetFilters() {
    sortPeriod.value = DEFAULT_SORT
    selectedStatuses.value = []
    periodRange.value = null

    await router.push({
      path: route.path,
      query: {},
    })

    if (await runInMockModeFromFirstPage()) {
      return
    }

    await fetchReports(1)
  }

  if (!isMockMode.value) {
    watch(
      () => route.query,
      () => {
        fetchReports(pagination.value.currentPage)
      },
      { deep: true },
    )
  }

  return {
    headers,
    reports,
    pagination,
    isLoading,
    isRefreshing,
    isTableBusy: tableLoading,
    error,
    isMockMode,
    sortPeriod,
    selectedStatuses,
    periodRange,
    hasActiveFilters,
    init,
    loadPage,
    handlePerPageChange,
    toggleSortOrder,
    applyStatusFilter,
    applyPeriodFilter,
    resetFilters,
    refreshReports: () => fetchReports(pagination.value.currentPage),
  }
}
