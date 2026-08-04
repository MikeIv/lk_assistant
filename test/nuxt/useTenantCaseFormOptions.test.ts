import { API_PATHS } from '#shared/constants/api'
import { APPLICANTS_MOCK_ITEMS } from '#shared/constants/applicantsMock'
import { NEGOTIATION_STATUSES_MOCK_ITEMS } from '#shared/constants/negotiationStatusesMock'
import { PREMISES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { networkError } from '../helpers/domainApiMock'
import { runComposable } from '../helpers/runComposable'
import { useTenantCaseFormOptions } from '~/composables/useTenantCaseFormOptions'

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

const unmounts: Array<() => void> = []

describe('useTenantCaseFormOptions', () => {
  beforeEach(() => {
    apiMock.mockReset()
    mockMode.value = true
  })

  afterEach(() => {
    while (unmounts.length) {
      unmounts.pop()?.()
    }
  })

  function mountOptions() {
    const { result, unmount } = runComposable(() => useTenantCaseFormOptions())
    unmounts.push(unmount)
    return result
  }

  it('mock mode loads directory mocks without API', async () => {
    const options = mountOptions()
    await vi.waitFor(() => expect(options.isLoading.value).toBe(false))

    expect(apiMock).not.toHaveBeenCalled()
    expect(options.rooms.value.length).toBe(Math.min(120, PREMISES_MOCK_ITEMS.length))
    expect(options.applicants.value).toEqual(APPLICANTS_MOCK_ITEMS)
    expect(options.negotiationStatuses.value).toEqual(NEGOTIATION_STATUSES_MOCK_ITEMS)
    expect(options.error.value).toBeNull()
  })

  it('api: fetches rooms, applicants and negotiation statuses with expected queries', async () => {
    mockMode.value = false
    apiMock.mockImplementation(async (request: string) => {
      const [path, query = ''] = String(request).split('?')
      const params = new URLSearchParams(query)

      if (path === API_PATHS.broker.rooms.list) {
        expect(params.get('available_for_tenant_case')).toBe('1')
        expect(params.get('page')).toBe('1')
        expect(params.get('per_page')).toBe('1000')
        expect(params.get('sort')).toBe('id')
        expect(params.get('direction')).toBe('asc')
        return {
          success: true,
          message: 'ok',
          payload: {
            data: [
              {
                id: 11,
                name: 'A-11',
                floor: '1',
                area: 20,
                room_type_id: 1,
                room_type: 'Торговое',
              },
            ],
            current_page: 1,
            per_page: 1000,
            total: 1,
            last_page: 1,
          },
        }
      }

      if (path === API_PATHS.broker.tenantApplicants.list) {
        expect(params.get('page')).toBe('1')
        expect(params.get('per_page')).toBe('1000')
        expect(params.get('sort')).toBe('id')
        expect(params.get('direction')).toBe('asc')
        return {
          success: true,
          message: 'ok',
          payload: {
            data: [
              {
                id: 21,
                title: 'Brand',
                category_id: 1,
                category: { id: 1, name: 'Food' },
                contacts: [],
              },
            ],
            current_page: 1,
            per_page: 1000,
            total: 1,
            last_page: 1,
          },
        }
      }

      if (path === API_PATHS.broker.negotiationStatuses.list) {
        expect(params.get('page')).toBe('1')
        expect(params.get('per_page')).toBe('1000')
        expect(params.get('sort')).toBe('id')
        expect(params.get('direction')).toBe('asc')
        return {
          success: true,
          message: 'ok',
          payload: {
            data: [
              {
                id: 31,
                status: 'переговоры',
                name: 'Переговоры',
                created_by_id: null,
                created_at: '2026-01-01T00:00:00Z',
              },
            ],
            current_page: 1,
            per_page: 1000,
            total: 1,
            last_page: 1,
          },
        }
      }

      throw new Error(`unexpected ${request}`)
    })

    const options = mountOptions()
    await vi.waitFor(() => expect(options.isLoading.value).toBe(false))

    expect(apiMock).toHaveBeenCalledTimes(3)
    expect(options.rooms.value).toHaveLength(1)
    expect(options.rooms.value[0]?.name).toBe('A-11')
    expect(options.applicants.value[0]?.title).toBe('Brand')
    expect(options.negotiationStatuses.value[0]?.status).toBe('переговоры')
  })

  it('api: sets error and clears lists on failure', async () => {
    mockMode.value = false
    apiMock.mockRejectedValue(networkError())

    const options = mountOptions()
    await vi.waitFor(() => expect(options.isLoading.value).toBe(false))

    expect(options.error.value).toBe('Не удалось загрузить справочники для формы')
    expect(options.rooms.value).toEqual([])
    expect(options.applicants.value).toEqual([])
    expect(options.negotiationStatuses.value).toEqual([])
  })

  it('reload re-fetches options in API mode', async () => {
    mockMode.value = false
    apiMock.mockResolvedValue({
      success: true,
      message: 'ok',
      payload: { data: [], current_page: 1, per_page: 1000, total: 0, last_page: 1 },
    })

    const options = mountOptions()
    await vi.waitFor(() => expect(options.isLoading.value).toBe(false))
    expect(apiMock).toHaveBeenCalledTimes(3)

    apiMock.mockClear()
    await options.reload()

    expect(apiMock).toHaveBeenCalledTimes(3)
    expect(options.error.value).toBeNull()
  })
})
