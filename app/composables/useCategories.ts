import { API_PATHS } from '#shared/constants/api'
import { CATEGORIES_MOCK_ITEMS } from '#shared/constants/categoriesMock'
import type {
  Category,
  CategoryCreateApiResponse,
  CategoryCreateFieldErrors,
  CategoryCreatePayload,
  CategoryCreateResult,
  CategoryDeleteResult,
  CategoriesListApiResponse,
  CategorySortDirection,
  CategorySortKey,
} from '#shared/types/categories'
import { normalizeCategory } from '#shared/utils/categoriesNormalize'
import {
  buildCategoriesPagination,
  matchesCategorySearch,
  paginateCategories,
  CATEGORIES_DEFAULT_PER_PAGE,
  CATEGORIES_DEFAULT_SORT_DIRECTION,
  CATEGORIES_DEFAULT_SORT_KEY,
  sortCategories,
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

/** Список категорий: API `brokerCategory.index` (client-side filter/sort/page) или mock. */
export function useCategories() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const sourceItems = ref<Category[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const mockExtraItems = ref<Category[]>([])
  const mockDeletedIds = ref<Set<number>>(new Set())
  const mockUpdatedItems = ref<Map<number, Category>>(new Map())

  const allItems = computed<Category[]>(() => {
    if (isMockMode.value) {
      return [
        ...CATEGORIES_MOCK_ITEMS.filter((item) => !mockDeletedIds.value.has(item.id)).map(
          (item) => mockUpdatedItems.value.get(item.id) ?? item,
        ),
        ...mockExtraItems.value.filter((item) => !mockDeletedIds.value.has(item.id)),
      ]
    }

    return sourceItems.value
  })

  const searchQuery = ref('')
  const sortKey = ref<CategorySortKey>(CATEGORIES_DEFAULT_SORT_KEY)
  const sortDirection = ref<CategorySortDirection>(CATEGORIES_DEFAULT_SORT_DIRECTION)
  const perPage = ref(CATEGORIES_DEFAULT_PER_PAGE)
  const currentPage = ref(1)

  const filteredItems = computed<Category[]>(() => {
    const query = searchQuery.value.trim()
    const filtered = query
      ? allItems.value.filter((item) => matchesCategorySearch(item, query))
      : allItems.value

    return sortCategories(filtered, sortKey.value, sortDirection.value)
  })

  const pagination = computed(() =>
    buildCategoriesPagination(filteredItems.value.length, currentPage.value, perPage.value),
  )

  const items = computed<Category[]>(() =>
    paginateCategories(filteredItems.value, pagination.value.currentPage, pagination.value.perPage),
  )

  watch(
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
      }
    },
  )

  async function fetchItems(options?: { silent?: boolean }) {
    if (!options?.silent) {
      isLoading.value = true
    }
    error.value = null

    try {
      if (isMockMode.value) {
        return
      }

      const response = await api<CategoriesListApiResponse>(API_PATHS.broker.categories.list)
      sourceItems.value = response.payload.items.map(normalizeCategory)
    } catch {
      error.value = 'Не удалось загрузить список категорий'
      sourceItems.value = []
    } finally {
      if (!options?.silent) {
        isLoading.value = false
      }
    }
  }

  function setPage(page: number) {
    currentPage.value = Math.max(1, Math.min(page, pagination.value.lastPage))
  }

  function setPerPage(value: number) {
    perPage.value = value
    currentPage.value = 1
  }

  function toggleSort(key: CategorySortKey) {
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
    void fetchItems()
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
        const duplicateErrors = findCategoryDuplicateErrors(allItems.value, normalizedPayload)

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

      await fetchItems({ silent: true })

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
        const duplicateErrors = findCategoryDuplicateErrors(allItems.value, normalizedPayload, id)

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

      await fetchItems({ silent: true })

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

      await fetchItems({ silent: true })

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
