import { REPORTS_MOCK_HEADERS, REPORTS_MOCK_ITEMS } from '#shared/constants/reportsMock'
import { parseReportPeriodStart } from '#shared/utils/reportsFormat'
import type {
  ReportItem,
  ReportPeriodRange,
  ReportPeriodSort,
  ReportStatus,
  ReportsPagination,
} from '#shared/types/reports'

const DEFAULT_SORT: ReportPeriodSort = 'desc'

function comparePeriods(a: ReportItem, b: ReportItem, order: ReportPeriodSort): number {
  const dateA = parseReportPeriodStart(a.period)?.getTime() ?? 0
  const dateB = parseReportPeriodStart(b.period)?.getTime() ?? 0

  if (order === 'default') {
    return 0
  }

  return order === 'asc' ? dateA - dateB : dateB - dateA
}

function matchesStatusFilter(item: ReportItem, statuses: ReportStatus[]): boolean {
  if (!statuses.length) {
    return true
  }

  return statuses.includes(item.status)
}

function matchesPeriodFilter(item: ReportItem, range: ReportPeriodRange | null): boolean {
  if (!range) {
    return true
  }

  const start = parseReportPeriodStart(item.period)

  if (!start) {
    return false
  }

  const from = new Date(range.from)
  const to = new Date(range.to)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return true
  }

  return start >= from && start <= to
}

/**
 * Локальная имитация `useReports` на мок-данных (п.2).
 * На п.3 заменяется или дополняется реальным API через `useReports`.
 */
export function useReportsMock() {
  const headers = REPORTS_MOCK_HEADERS

  const perPage = ref(12)
  const currentPage = ref(1)
  const sortPeriod = ref<ReportPeriodSort>(DEFAULT_SORT)
  const selectedStatuses = ref<ReportStatus[]>([])
  const periodRange = ref<ReportPeriodRange | null>(null)
  const isLoading = ref(false)

  const filteredItems = computed(() =>
    REPORTS_MOCK_ITEMS.filter(
      (item) =>
        matchesStatusFilter(item, selectedStatuses.value) &&
        matchesPeriodFilter(item, periodRange.value),
    ),
  )

  const sortedItems = computed(() => {
    if (sortPeriod.value === 'default') {
      return [...filteredItems.value]
    }

    return [...filteredItems.value].sort((a, b) => comparePeriods(a, b, sortPeriod.value))
  })

  const pagination = computed<ReportsPagination>(() => {
    const total = sortedItems.value.length
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
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

  const reports = computed(() => {
    const { currentPage: page, perPage: pageSize } = pagination.value
    const start = (page - 1) * pageSize

    return sortedItems.value.slice(start, start + pageSize)
  })

  const hasActiveFilters = computed(
    () =>
      selectedStatuses.value.length > 0 ||
      periodRange.value !== null ||
      sortPeriod.value !== DEFAULT_SORT,
  )

  async function withLoadingDelay<T>(action: () => T | Promise<T>): Promise<T> {
    isLoading.value = true
    await new Promise((resolve) => setTimeout(resolve, 180))
    try {
      return await action()
    } finally {
      isLoading.value = false
    }
  }

  async function loadPage(page: number) {
    await withLoadingDelay(() => {
      currentPage.value = Math.max(1, Math.min(page, pagination.value.lastPage))
    })
  }

  async function handlePerPageChange(value: number | 'all') {
    await withLoadingDelay(() => {
      perPage.value = value === 'all' ? pagination.value.total || 1000 : value
      currentPage.value = 1
    })
  }

  async function toggleSortOrder(order: ReportPeriodSort) {
    await withLoadingDelay(() => {
      sortPeriod.value = order
      currentPage.value = 1
    })
  }

  async function applyStatusFilter(statuses: ReportStatus[]) {
    await withLoadingDelay(() => {
      selectedStatuses.value = statuses
      currentPage.value = 1
    })
  }

  async function applyPeriodFilter(range: { start: string; end: string } | null) {
    await withLoadingDelay(() => {
      if (!range?.start || !range.end) {
        periodRange.value = null
      } else {
        periodRange.value = { from: range.start, to: range.end }
      }

      currentPage.value = 1
    })
  }

  async function resetFilters() {
    await withLoadingDelay(() => {
      sortPeriod.value = DEFAULT_SORT
      selectedStatuses.value = []
      periodRange.value = null
      currentPage.value = 1
    })
  }

  return {
    headers,
    reports,
    pagination,
    isLoading,
    sortPeriod,
    selectedStatuses,
    periodRange,
    hasActiveFilters,
    loadPage,
    handlePerPageChange,
    toggleSortOrder,
    applyStatusFilter,
    applyPeriodFilter,
    resetFilters,
  }
}
