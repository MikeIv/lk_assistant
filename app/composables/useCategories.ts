import { API_PATHS } from '#shared/constants/api'
import { CATEGORIES_MOCK_ITEMS } from '#shared/constants/categoriesMock'
import type {
  CategoriesListApiResponse,
  CategoriesPagination,
  Category,
  CategoryCreateApiResponse,
  CategoryCreateFieldErrors,
  CategoryCreatePayload,
  CategoryCreateResult,
  CategoryDeleteResult,
  CategorySortDirection,
  CategorySortKey,
} from '#shared/types/categories'
import { normalizeCategory } from '#shared/utils/categoriesNormalize'
import { buildCategoriesQueryParams } from '#shared/utils/categoriesQuery'
import {
  buildCategoriesPagination,
  CATEGORIES_DEFAULT_PER_PAGE,
  CATEGORIES_DEFAULT_SORT_DIRECTION,
  CATEGORIES_DEFAULT_SORT_KEY,
  matchesCategorySearch,
  paginateCategories,
  sortCategories,
  toCategoriesApiPagination,
} from '#shared/utils/categoriesTable'
import {
  emptyCategoryCreateFieldErrors,
  findCategoryDuplicateErrors,
  hasCategoryCreateFieldErrors,
  normalizeCategoryCreatePayload,
  parseCategoryCreateFieldErrors,
  validateCategoryFormPayload,
} from '#shared/utils/categoriesValidation'
import { useApiConfig } from '~/composables/useApiConfig'
import type { FetchError } from 'ofetch'

const SEARCH_DEBOUNCE_MS = 300

/** Список категорий: API `brokerCategory.index` или mock без `NUXT_PUBLIC_API_BASE`. */
export function useCategories() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const apiResponse = ref<CategoriesListApiResponse | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<Category[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, Category>>(new Map())

  const mockSourceItems = computed<Category[]>(() => [
    ...CATEGORIES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
      (item) => mockUpdatedItems.value.get(item.id) ?? item,
    ),
    ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
  ])

  const searchQuery = ref('')
  const sortKey = ref<CategorySortKey>(CATEGORIES_DEFAULT_SORT_KEY)
  const sortDirection = ref<CategorySortDirection>(CATEGORIES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(CATEGORIES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const mockSortedItems = computed<Category[]>(() => {
    if (!isMockMode.value) {
      return []
    }

    const query = searchQuery.value.trim()
    const filtered = query
      ? mockSourceItems.value.filter((item) => matchesCategorySearch(item, query))
      : mockSourceItems.value

    return sortCategories(filtered, sortKey.value, sortDirection.value)
  })

  const mockPagination = computed<CategoriesPagination>(() =>
    isMockMode.value
      ? buildCategoriesPagination(mockSortedItems.value.length, currentPage.value, perPage.value)
      : buildCategoriesPagination(0, 1, perPage.value),
  )

  const mockItems = computed<Category[]>(() =>
    isMockMode.value
      ? paginateCategories(mockSortedItems.value, currentPage.value, perPage.value)
      : [],
  )

  const apiPagination = computed<CategoriesPagination>(() => {
    const payload = apiResponse.value?.payload

    return payload
      ? toCategoriesApiPagination(payload)
      : buildCategoriesPagination(0, 1, perPage.value)
  })

  const pagination = computed<CategoriesPagination>(() =>
    isMockMode.value ? mockPagination.value : apiPagination.value,
  )

  const items = computed<Category[]>(() => {
    if (isMockMode.value) {
      return mockItems.value
    }

    return (apiResponse.value?.payload.data ?? []).map(normalizeCategory)
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

      const query = buildCategoriesQueryParams({
        page,
        perPage: perPage.value,
        search: searchQuery.value,
        sortKey: sortKey.value,
        sortDirection: sortDirection.value,
      })

      apiResponse.value = await api<CategoriesListApiResponse>(
        `${API_PATHS.broker.categories.list}?${query}`,
      )
      currentPage.value = apiResponse.value.payload.current_page
    } catch {
      error.value = 'Не удалось загрузить список категорий'
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

  function toggleSort(key: CategorySortKey) {
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

  function validationFailure(fieldErrors: CategoryCreateFieldErrors): CategoryCreateResult {
    return { ok: false, fieldErrors, generalError: null }
  }

  function mutationFailure(cause: unknown, fallbackMessage: string): CategoryCreateResult {
    const fetchError = cause as FetchError<unknown>
    const status = fetchError.response?.status ?? fetchError.statusCode

    if (status === 422) {
      const fieldErrors = parseCategoryCreateFieldErrors(fetchError.data)

      return {
        ok: false,
        fieldErrors,
        generalError: hasCategoryCreateFieldErrors(fieldErrors) ? null : fallbackMessage,
      }
    }

    return {
      ok: false,
      fieldErrors: emptyCategoryCreateFieldErrors(),
      generalError: fallbackMessage,
    }
  }

  async function createCategory(payload: CategoryCreatePayload): Promise<CategoryCreateResult> {
    const normalizedPayload = normalizeCategoryCreatePayload(payload)

    const clientFieldErrors = validateCategoryFormPayload(normalizedPayload)
    if (hasCategoryCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findCategoryDuplicateErrors(
          mockSourceItems.value,
          normalizedPayload,
        )

        if (hasCategoryCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        mockExtraItems.value.push({
          id: CATEGORIES_MOCK_ITEMS.length + mockExtraItems.value.length + 1,
          name: normalizedPayload.name,
        })

        return { ok: true }
      }

      await api<CategoryCreateApiResponse>(API_PATHS.broker.categories.list, {
        method: 'POST',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось создать категорию')
    }
  }

  async function updateCategory(
    id: number,
    payload: CategoryCreatePayload,
  ): Promise<CategoryCreateResult> {
    const normalizedPayload = normalizeCategoryCreatePayload(payload)

    const clientFieldErrors = validateCategoryFormPayload(normalizedPayload)
    if (hasCategoryCreateFieldErrors(clientFieldErrors)) {
      return validationFailure(clientFieldErrors)
    }

    try {
      if (isMockMode.value) {
        const duplicateErrors = findCategoryDuplicateErrors(
          mockSourceItems.value,
          normalizedPayload,
          id,
        )

        if (hasCategoryCreateFieldErrors(duplicateErrors)) {
          return validationFailure(duplicateErrors)
        }

        const updatedCategory: Category = {
          id,
          name: normalizedPayload.name,
        }

        const extraIndex = mockExtraItems.value.findIndex((item) => item.id === id)
        if (extraIndex >= 0) {
          mockExtraItems.value.splice(extraIndex, 1, updatedCategory)
        } else {
          mockUpdatedItems.value.set(id, updatedCategory)
        }

        return { ok: true }
      }

      await api<CategoryCreateApiResponse>(API_PATHS.broker.categories.detail(id), {
        method: 'PUT',
        body: normalizedPayload,
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch (cause) {
      return mutationFailure(cause, 'Не удалось обновить категорию')
    }
  }

  async function deleteCategory(id: number): Promise<CategoryDeleteResult> {
    try {
      if (isMockMode.value) {
        mockDeletedIds.value = new Set([...mockDeletedIds.value, id])
        mockUpdatedItems.value.delete(id)
        mockExtraItems.value = mockExtraItems.value.filter((item) => item.id !== id)

        return { ok: true }
      }

      await api(API_PATHS.broker.categories.detail(id), {
        method: 'DELETE',
      })

      await fetchItems(currentPage.value, { silent: true })

      return { ok: true }
    } catch {
      return {
        ok: false,
        generalError: 'Не удалось удалить категорию',
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
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
