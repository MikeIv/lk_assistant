import { API_PATHS } from '#shared/constants/api'
import { APPLICANTS_MOCK_ITEMS } from '#shared/constants/applicantsMock'
import { CATEGORIES_MOCK_ITEMS } from '#shared/constants/categoriesMock'
import { LEGAL_ENTITIES_MOCK_ITEMS } from '#shared/constants/legalEntitiesMock'
import { NEGOTIATION_STATUSES_MOCK_ITEMS } from '#shared/constants/negotiationStatusesMock'
import { PREMISES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import { ROOM_TYPES_MOCK_ITEMS } from '#shared/constants/roomTypesMock'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick } from 'vue'
import { networkError, validationError } from '../helpers/domainApiMock'
import { runComposable } from '../helpers/runComposable'
import { useApplicants } from '~/composables/useApplicants'
import { useCategories } from '~/composables/useCategories'
import { useLgEntities } from '~/composables/useLgEntities'
import { useNegotiationStatuses } from '~/composables/useNegotiationStatuses'
import { usePremises } from '~/composables/usePremises'
import { useRoomTypes } from '~/composables/useRoomTypes'

const { apiMock, mockMode } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  mockMode: { value: true },
}))

mockNuxtImport('useApi', () => () => apiMock)

vi.mock('~/composables/useApiConfig', () => ({
  useApiConfig: () => ({
    apiBase: computed(() => (mockMode.value ? '' : 'https://api.test')),
    isMockMode: computed(() => mockMode.value),
    apiDocsUrl: 'https://docs.test',
  }),
}))

type MutationResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, unknown>; generalError: string | null }

type DirectoryHarness = {
  items: { value: Array<Record<string, unknown>> }
  pagination: {
    value: { currentPage: number; lastPage: number; perPage: number; total: number }
  }
  searchQuery: { value: string }
  sortKey: { value: string }
  sortDirection: { value: string }
  perPage: { value: number }
  error: { value: string | null }
  setPage: (page: number) => void
  setPerPage: (value: number) => void
  toggleSort: (key: string) => void
  refresh: () => Promise<void>
  create: (payload: unknown) => Promise<MutationResult>
  update: (id: number, payload: unknown) => Promise<MutationResult>
  delete: (id: number) => Promise<{ ok: true } | { ok: false; generalError: string }>
}

type DirectoryContract = {
  name: string
  mockTotal: number
  loadError: string
  listPath: string
  detailPath: (id: number) => string
  sortKeyForToggle: string
  fieldErrorKey: string
  uniqueLabel: string
  updatedLabel: string
  searchNeedle: string
  createPayload: unknown
  updatePayload: unknown
  apiListResponse: unknown
  validationErrors: Record<string, string[]>
  labelOf: (item: Record<string, unknown>) => string
  setup: () => DirectoryHarness
}

function wrapNameOnly(methods: {
  create: (p: { name: string }) => Promise<MutationResult>
  update: (id: number, p: { name: string }) => Promise<MutationResult>
  delete: (id: number) => Promise<{ ok: true } | { ok: false; generalError: string }>
}): Pick<DirectoryHarness, 'create' | 'update' | 'delete'> {
  return {
    create: (payload) => methods.create(payload as { name: string }),
    update: (id, payload) => methods.update(id, payload as { name: string }),
    delete: methods.delete,
  }
}

const contracts: DirectoryContract[] = [
  {
    name: 'categories',
    mockTotal: CATEGORIES_MOCK_ITEMS.length,
    loadError: 'Не удалось загрузить список категорий',
    listPath: API_PATHS.broker.categories.list,
    detailPath: API_PATHS.broker.categories.detail,
    sortKeyForToggle: 'name',
    fieldErrorKey: 'name',
    uniqueLabel: 'Test Category Unique',
    updatedLabel: 'Test Category Updated',
    searchNeedle: 'Розничная торговля',
    createPayload: { name: 'Test Category Unique' },
    updatePayload: { name: 'Test Category Updated' },
    apiListResponse: {
      success: true,
      message: 'ok',
      payload: { items: [{ id: 1, name: 'API Category' }] },
    },
    validationErrors: { name: ['already taken'] },
    labelOf: (item) => String(item.name),
    setup: () => {
      const c = useCategories()
      return {
        items: c.items as DirectoryHarness['items'],
        pagination: c.pagination,
        searchQuery: c.searchQuery,
        sortKey: c.sortKey,
        sortDirection: c.sortDirection,
        perPage: c.perPage,
        error: c.error,
        setPage: c.setPage,
        setPerPage: c.setPerPage,
        toggleSort: c.toggleSort as DirectoryHarness['toggleSort'],
        refresh: c.refresh,
        ...wrapNameOnly({
          create: c.createCategory,
          update: c.updateCategory,
          delete: c.deleteCategory,
        }),
      }
    },
  },
  {
    name: 'roomTypes',
    mockTotal: ROOM_TYPES_MOCK_ITEMS.length,
    loadError: 'Не удалось загрузить список типов помещений',
    listPath: API_PATHS.broker.roomTypes.list,
    detailPath: API_PATHS.broker.roomTypes.detail,
    sortKeyForToggle: 'name',
    fieldErrorKey: 'name',
    uniqueLabel: 'Test RoomType Unique',
    updatedLabel: 'Test RoomType Updated',
    searchNeedle: 'Торговое',
    createPayload: { name: 'Test RoomType Unique' },
    updatePayload: { name: 'Test RoomType Updated' },
    apiListResponse: {
      success: true,
      message: 'ok',
      payload: { items: [{ id: 1, name: 'API RoomType' }] },
    },
    validationErrors: { name: ['already taken'] },
    labelOf: (item) => String(item.name),
    setup: () => {
      const c = useRoomTypes()
      return {
        items: c.items as DirectoryHarness['items'],
        pagination: c.pagination,
        searchQuery: c.searchQuery,
        sortKey: c.sortKey,
        sortDirection: c.sortDirection,
        perPage: c.perPage,
        error: c.error,
        setPage: c.setPage,
        setPerPage: c.setPerPage,
        toggleSort: c.toggleSort as DirectoryHarness['toggleSort'],
        refresh: c.refresh,
        ...wrapNameOnly({
          create: c.createRoomType,
          update: c.updateRoomType,
          delete: c.deleteRoomType,
        }),
      }
    },
  },
  {
    name: 'negotiationStatuses',
    mockTotal: NEGOTIATION_STATUSES_MOCK_ITEMS.length,
    loadError: 'Не удалось загрузить список статусов переговоров',
    listPath: API_PATHS.broker.negotiationStatuses.list,
    detailPath: API_PATHS.broker.negotiationStatuses.detail,
    sortKeyForToggle: 'name',
    fieldErrorKey: 'name',
    uniqueLabel: 'Test Status Unique',
    updatedLabel: 'Test Status Updated',
    searchNeedle: 'переговоры',
    createPayload: { name: 'Test Status Unique' },
    updatePayload: { name: 'Test Status Updated' },
    apiListResponse: {
      success: true,
      message: 'ok',
      payload: {
        items: [
          {
            id: 1,
            status: 'API Status',
            name: 'API Status',
            created_by_id: null,
            responsible: null,
            created_at: '2026-01-01 00:00:00',
          },
        ],
      },
    },
    validationErrors: { name: ['already taken'] },
    labelOf: (item) => String(item.name ?? item.status),
    setup: () => {
      const c = useNegotiationStatuses()
      return {
        items: c.items as DirectoryHarness['items'],
        pagination: c.pagination,
        searchQuery: c.searchQuery,
        sortKey: c.sortKey,
        sortDirection: c.sortDirection,
        perPage: c.perPage,
        error: c.error,
        setPage: c.setPage,
        setPerPage: c.setPerPage,
        toggleSort: c.toggleSort as DirectoryHarness['toggleSort'],
        refresh: c.refresh,
        ...wrapNameOnly({
          create: c.createNegotiationStatus,
          update: c.updateNegotiationStatus,
          delete: c.deleteNegotiationStatus,
        }),
      }
    },
  },
  {
    name: 'premises',
    mockTotal: PREMISES_MOCK_ITEMS.length,
    loadError: 'Не удалось загрузить список помещений',
    listPath: API_PATHS.broker.rooms.list,
    detailPath: API_PATHS.broker.rooms.detail,
    sortKeyForToggle: 'name',
    fieldErrorKey: 'name',
    uniqueLabel: 'W4-99-01',
    updatedLabel: 'W4-99-02',
    searchNeedle: '100-01',
    createPayload: {
      room_type_id: 1,
      name: 'W4-99-01',
      floor: '1',
      area: 12.5,
      name_bti: null,
      floor_bti: null,
      area_bti: null,
    },
    updatePayload: {
      room_type_id: 1,
      name: 'W4-99-02',
      floor: '2',
      area: 20,
      name_bti: null,
      floor_bti: null,
      area_bti: null,
    },
    apiListResponse: {
      success: true,
      message: 'ok',
      payload: {
        items: [
          {
            id: 1,
            name: 'API-01',
            floor: '1',
            area: 10,
            name_bti: null,
            floor_bti: null,
            area_bti: null,
            room_type_id: 1,
            room_type: 'Торговое',
          },
        ],
      },
    },
    validationErrors: { name: ['already taken'] },
    labelOf: (item) => String(item.name),
    setup: () => {
      const c = usePremises()
      return {
        items: c.items as DirectoryHarness['items'],
        pagination: c.pagination,
        searchQuery: c.searchQuery,
        sortKey: c.sortKey,
        sortDirection: c.sortDirection,
        perPage: c.perPage,
        error: c.error,
        setPage: c.setPage,
        setPerPage: c.setPerPage,
        toggleSort: c.toggleSort as DirectoryHarness['toggleSort'],
        refresh: c.refresh,
        create: (payload) => c.createPremise(payload as never),
        update: (id, payload) => c.updatePremise(id, payload as never),
        delete: c.deletePremise,
      }
    },
  },
  {
    name: 'legalEntities',
    mockTotal: LEGAL_ENTITIES_MOCK_ITEMS.length,
    loadError: 'Не удалось загрузить список юридических лиц',
    listPath: API_PATHS.broker.legalEntities.list,
    detailPath: API_PATHS.broker.legalEntities.detail,
    sortKeyForToggle: 'legal_entity',
    fieldErrorKey: 'legal_entity',
    uniqueLabel: 'ООО Test Legal Unique',
    updatedLabel: 'ООО Test Legal Updated',
    searchNeedle: 'Альфа Трейд',
    createPayload: {
      legal_entity: 'ООО Test Legal Unique',
      inn: '9900099001',
      kpp: '990001001',
    },
    updatePayload: {
      legal_entity: 'ООО Test Legal Updated',
      inn: '9900099002',
      kpp: null,
    },
    apiListResponse: {
      success: true,
      message: 'ok',
      payload: {
        data: [{ id: 1, legal_entity: 'API LE', inn: '7700000001', kpp: null }],
        current_page: 1,
        per_page: 10,
        total: 1,
        last_page: 1,
      },
    },
    validationErrors: { legal_entity: ['already taken'] },
    labelOf: (item) => String(item.legal_entity),
    setup: () => {
      const c = useLgEntities()
      return {
        items: c.items as DirectoryHarness['items'],
        pagination: c.pagination,
        searchQuery: c.searchQuery,
        sortKey: c.sortKey,
        sortDirection: c.sortDirection,
        perPage: c.perPage,
        error: c.error,
        setPage: c.setPage,
        setPerPage: c.setPerPage,
        toggleSort: c.toggleSort as DirectoryHarness['toggleSort'],
        refresh: c.refresh,
        create: (payload) => c.createLegalEntity(payload as never),
        update: (id, payload) => c.updateLegalEntity(id, payload as never),
        delete: c.deleteLegalEntity,
      }
    },
  },
  {
    name: 'applicants',
    mockTotal: APPLICANTS_MOCK_ITEMS.length,
    loadError: 'Не удалось загрузить список претендентов',
    listPath: API_PATHS.broker.tenantApplicants.list,
    detailPath: API_PATHS.broker.tenantApplicants.detail,
    sortKeyForToggle: 'title',
    fieldErrorKey: 'title',
    uniqueLabel: 'Test Applicant Unique',
    updatedLabel: 'Test Applicant Updated',
    searchNeedle: 'Coffee House',
    createPayload: {
      title: 'Test Applicant Unique',
      category_id: 1,
      company_group: null,
      legal_entity_ids: null,
      contacts: null,
    },
    updatePayload: {
      title: 'Test Applicant Updated',
      category_id: 1,
      company_group: 'Group',
      legal_entity_ids: null,
      contacts: null,
    },
    apiListResponse: {
      success: true,
      message: 'ok',
      payload: {
        data: [
          {
            id: 1,
            title: 'API Applicant',
            company_group: null,
            category_id: 1,
            category: { id: 1, name: 'Cat' },
            legal_entities: [],
            contacts: [],
          },
        ],
        current_page: 1,
        per_page: 10,
        total: 1,
        last_page: 1,
      },
    },
    validationErrors: { title: ['already taken'] },
    labelOf: (item) => String(item.title),
    setup: () => {
      const c = useApplicants()
      return {
        items: c.items as DirectoryHarness['items'],
        pagination: c.pagination,
        searchQuery: c.searchQuery,
        sortKey: c.sortKey,
        sortDirection: c.sortDirection,
        perPage: c.perPage,
        error: c.error,
        setPage: c.setPage,
        setPerPage: c.setPerPage,
        toggleSort: c.toggleSort as DirectoryHarness['toggleSort'],
        refresh: c.refresh,
        create: (payload) => c.createApplicant(payload as never),
        update: (id, payload) => c.updateApplicant(id, payload as never),
        delete: c.deleteApplicant,
      }
    },
  },
]

const unmounts: Array<() => void> = []

describe.each(contracts)('directory composable: $name', (contract) => {
  beforeEach(() => {
    apiMock.mockReset()
    mockMode.value = true
  })

  afterEach(() => {
    while (unmounts.length) {
      unmounts.pop()?.()
    }
  })

  function mountHarness() {
    const { result, unmount } = runComposable(() => contract.setup())
    unmounts.push(unmount)
    return result
  }

  it('mock: lists items and supports create/update/delete with id generation', async () => {
    const harness = mountHarness()
    await nextTick()

    expect(harness.pagination.value.total).toBe(contract.mockTotal)
    expect(harness.items.value.length).toBeGreaterThan(0)

    const createResult = await harness.create(contract.createPayload)
    expect(createResult).toEqual({ ok: true })
    expect(harness.pagination.value.total).toBe(contract.mockTotal + 1)

    const created = harness.items.value.find(
      (item) => contract.labelOf(item) === contract.uniqueLabel,
    )
    expect(created).toBeTruthy()
    expect(typeof created!.id).toBe('number')
    expect(created!.id as number).toBeGreaterThan(contract.mockTotal)

    const updateResult = await harness.update(created!.id as number, contract.updatePayload)
    expect(updateResult).toEqual({ ok: true })
    expect(
      harness.items.value.some((item) => contract.labelOf(item) === contract.updatedLabel),
    ).toBe(true)

    const deleteResult = await harness.delete(created!.id as number)
    expect(deleteResult).toEqual({ ok: true })
    expect(harness.pagination.value.total).toBe(contract.mockTotal)
    expect(
      harness.items.value.some((item) => contract.labelOf(item) === contract.updatedLabel),
    ).toBe(false)
  })

  it('mock: search/sort/page reset to 1 and collapse currentPage when lastPage shrinks', async () => {
    const harness = mountHarness()
    await nextTick()

    // Ensure enough pages for entities with tiny mocks (negotiationStatuses).
    if (contract.mockTotal < 5) {
      await harness.create({ name: `${contract.uniqueLabel} page-a` })
      await harness.create({ name: `${contract.uniqueLabel} page-b` })
      await harness.create({ name: `${contract.uniqueLabel} page-c` })
    }

    harness.setPerPage(1)
    expect(harness.pagination.value.currentPage).toBe(1)
    harness.setPage(Math.min(3, harness.pagination.value.lastPage))
    expect(harness.pagination.value.currentPage).toBeGreaterThan(1)

    harness.searchQuery.value = contract.searchNeedle
    await nextTick()
    expect(harness.pagination.value.currentPage).toBe(1)

    harness.searchQuery.value = ''
    await nextTick()
    harness.perPage.value = 1
    await nextTick()
    harness.setPage(harness.pagination.value.lastPage)
    expect(harness.pagination.value.currentPage).toBeGreaterThan(1)

    // Mutate perPage directly so setPerPage does not force page=1 — covers lastPage watch.
    harness.perPage.value = 1000
    await nextTick()
    expect(harness.pagination.value.currentPage).toBe(1)
    expect(harness.pagination.value.currentPage).toBeLessThanOrEqual(
      harness.pagination.value.lastPage,
    )

    harness.setPage(1)
    harness.toggleSort(contract.sortKeyForToggle)
    expect(harness.pagination.value.currentPage).toBe(1)
    expect(harness.sortKey.value).toBe(contract.sortKeyForToggle)
  })

  it('api: loads list, maps 422 to fieldErrors, sets load error text', async () => {
    mockMode.value = false
    apiMock.mockImplementation(async (request: string) => {
      const path = String(request).split('?')[0]
      if (path === contract.listPath || path.startsWith(`${contract.listPath}?`)) {
        return contract.apiListResponse
      }
      // premises / applicants pull related dictionaries on mount
      if (path === API_PATHS.broker.roomTypes.list) {
        return { success: true, message: 'ok', payload: { items: [{ id: 1, name: 'Type' }] } }
      }
      if (path === API_PATHS.broker.categories.list) {
        return { success: true, message: 'ok', payload: { items: [{ id: 1, name: 'Cat' }] } }
      }
      if (path.startsWith(API_PATHS.broker.legalEntities.list)) {
        return {
          success: true,
          message: 'ok',
          payload: {
            data: [],
            current_page: 1,
            per_page: 1000,
            total: 0,
            last_page: 1,
          },
        }
      }
      throw new Error(`unexpected request: ${request}`)
    })

    const harness = mountHarness()
    await vi.waitFor(() => {
      expect(harness.items.value.length).toBeGreaterThan(0)
    })

    expect(contract.labelOf(harness.items.value[0]!)).toContain('API')

    apiMock.mockRejectedValueOnce(validationError(contract.validationErrors))
    const createFail = await harness.create(contract.createPayload)
    expect(createFail.ok).toBe(false)
    if (!createFail.ok) {
      expect(createFail.fieldErrors[contract.fieldErrorKey]).toBe('already taken')
      expect(createFail.generalError).toBeNull()
    }

    apiMock.mockRejectedValueOnce(networkError())
    await harness.refresh()
    expect(harness.error.value).toBe(contract.loadError)
  })

  it('api: create/update/delete call expected endpoints', async () => {
    mockMode.value = false
    apiMock.mockImplementation(async (request: string, options?: { method?: string }) => {
      const path = String(request).split('?')[0]
      const method = options?.method ?? 'GET'

      if (method === 'GET' && (path === contract.listPath || path.startsWith(contract.listPath))) {
        return contract.apiListResponse
      }
      if (path === API_PATHS.broker.roomTypes.list) {
        return { success: true, message: 'ok', payload: { items: [{ id: 1, name: 'Type' }] } }
      }
      if (path === API_PATHS.broker.categories.list) {
        return { success: true, message: 'ok', payload: { items: [{ id: 1, name: 'Cat' }] } }
      }
      if (path.startsWith(API_PATHS.broker.legalEntities.list) && method === 'GET') {
        return {
          success: true,
          message: 'ok',
          payload: { data: [], current_page: 1, per_page: 1000, total: 0, last_page: 1 },
        }
      }
      if (method === 'POST' && path === contract.listPath) {
        return { success: true, message: 'ok', payload: { id: 99 } }
      }
      if (method === 'PUT' && path === contract.detailPath(1)) {
        return { success: true, message: 'ok', payload: { id: 1 } }
      }
      if (method === 'DELETE' && path === contract.detailPath(1)) {
        return { success: true, message: 'ok' }
      }
      throw new Error(`unexpected ${method} ${request}`)
    })

    const harness = mountHarness()
    await vi.waitFor(() => expect(harness.items.value.length).toBeGreaterThan(0))

    await expect(harness.create(contract.createPayload)).resolves.toEqual({ ok: true })
    await expect(harness.update(1, contract.updatePayload)).resolves.toEqual({ ok: true })
    await expect(harness.delete(1)).resolves.toEqual({ ok: true })

    const methods = apiMock.mock.calls.map((call) => call[1]?.method ?? 'GET')
    expect(methods).toContain('POST')
    expect(methods).toContain('PUT')
    expect(methods).toContain('DELETE')
  })
})
