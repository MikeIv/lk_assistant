import { API_PATHS } from '#shared/constants/api'
import { APPLICANTS_MOCK_ITEMS } from '#shared/constants/applicantsMock'
import { PREMISES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import { TENANT_CASES_MOCK_ITEMS } from '#shared/constants/tenantCasesMock'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick } from 'vue'
import { makeAccessToken } from '../helpers/jwt'
import { networkError, validationError } from '../helpers/domainApiMock'
import { runComposable } from '../helpers/runComposable'
import { resetAuthClientState } from './resetAuthClientState'
import { useAuthToken } from '~/composables/useAuthToken'
import { useTenantCases } from '~/composables/useTenantCases'

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

const MOCK_STATE_KEYS = [
  'tenant-cases:mock-extra',
  'tenant-cases:mock-deleted',
  'tenant-cases:mock-updated',
] as const

const unmounts: Array<() => void> = []

function storePayload() {
  return {
    room_id: PREMISES_MOCK_ITEMS[0]!.id,
    responsible: 42,
    tenant_applicant_id: APPLICANTS_MOCK_ITEMS[0]!.id,
    first_contact_date: '2026-07-01',
    negotiation_date: '2026-07-02',
    negotiation_info: 'Первый контакт',
  }
}

function updatePayload() {
  return {
    room_id: PREMISES_MOCK_ITEMS[1]!.id,
    responsible: 43,
    applicants: [
      {
        id: null,
        tenant_applicant_id: APPLICANTS_MOCK_ITEMS[0]!.id,
        negotiation_status_id: 1,
        first_contact_date: '2026-07-01',
        next_contact_date: null,
        negotiations: [{ date: '2026-07-02', info: 'Обновлено' }],
      },
    ],
  }
}

describe('useTenantCases', () => {
  beforeEach(() => {
    apiMock.mockReset()
    mockMode.value = true
    resetAuthClientState()
    for (const key of MOCK_STATE_KEYS) {
      clearNuxtState(key)
    }
  })

  afterEach(() => {
    while (unmounts.length) {
      unmounts.pop()?.()
    }
  })

  function mountCases() {
    const { result, unmount } = runComposable(() => useTenantCases())
    unmounts.push(unmount)
    return result
  }

  it('mock: create/update/delete change list and generate id', async () => {
    const cases = mountCases()
    await nextTick()

    const initialTotal = cases.pagination.value.total
    expect(initialTotal).toBe(TENANT_CASES_MOCK_ITEMS.length)

    const created = await cases.createTenantCase(storePayload())
    expect(created).toEqual({ ok: true })
    expect(cases.pagination.value.total).toBe(initialTotal + 1)

    const createdItem = cases.items.value.find((item) => item.responsible_id === 42)
    expect(createdItem).toBeTruthy()
    expect(createdItem!.id).toBeGreaterThan(TENANT_CASES_MOCK_ITEMS.length)

    const updated = await cases.updateTenantCase(createdItem!.id, updatePayload())
    expect(updated).toEqual({ ok: true })
    expect(cases.items.value.some((item) => item.responsible_id === 43)).toBe(true)

    const deleted = await cases.deleteTenantCase(createdItem!.id)
    expect(deleted).toEqual({ ok: true })
    expect(cases.pagination.value.total).toBe(initialTotal)
  })

  it('mock: fetchTenantCase returns item; search resets page; lastPage collapses', async () => {
    const cases = mountCases()
    await nextTick()

    const existing = await cases.fetchTenantCase(1)
    expect(existing?.id).toBe(1)

    cases.perPage.value = 1
    await nextTick()
    cases.setPage(cases.pagination.value.lastPage)
    expect(cases.pagination.value.currentPage).toBeGreaterThan(1)

    cases.searchQuery.value = 'Funny Socks'
    await nextTick()
    expect(cases.pagination.value.currentPage).toBe(1)

    cases.searchQuery.value = ''
    await nextTick()
    cases.perPage.value = 1
    await nextTick()
    cases.setPage(cases.pagination.value.lastPage)
    cases.perPage.value = 1000
    await nextTick()
    expect(cases.pagination.value.currentPage).toBe(1)
  })

  it('api: loads list with user_id from JWT, maps 422, sets load error', async () => {
    mockMode.value = false
    const { persistTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({ sub: '77' }),
      remember: false,
    })

    apiMock.mockImplementation(async (request: string, options?: { method?: string }) => {
      const [path, query = ''] = String(request).split('?')
      const method = options?.method ?? 'GET'

      if (method === 'GET' && path === API_PATHS.broker.tenantCases.list) {
        expect(new URLSearchParams(query).get('user_id')).toBe('77')
        return {
          success: true,
          message: 'ok',
          payload: {
            data: [
              {
                id: 7,
                room_id: 1,
                room: { id: '1', category: 'Торговое', floor: '1', name: 'A-1', area: 10 },
                current_tenant: 'API Tenant',
                responsible_id: 3,
                responsible: 'API Broker',
                applicants: [],
                kp: { rows: [] },
              },
            ],
            current_page: 1,
            per_page: 10,
            total: 1,
            last_page: 1,
          },
        }
      }

      throw new Error(`unexpected ${method} ${request}`)
    })

    const cases = mountCases()
    await vi.waitFor(() => expect(cases.items.value.length).toBe(1))
    expect(cases.items.value[0]!.id).toBe(7)

    apiMock.mockRejectedValueOnce(validationError({ room_id: ['invalid room'] }))
    const fail = await cases.createTenantCase(storePayload())
    expect(fail.ok).toBe(false)
    if (!fail.ok) {
      expect(fail.fieldErrors.room_id).toBe('invalid room')
      expect(fail.generalError).toBeNull()
    }

    apiMock.mockRejectedValueOnce(networkError())
    await cases.refresh()
    expect(cases.error.value).toBe('Не удалось загрузить список текущих дел')
  })

  it('api: detail/create/update/delete hit expected endpoints', async () => {
    mockMode.value = false
    apiMock.mockImplementation(async (request: string, options?: { method?: string }) => {
      const path = String(request).split('?')[0]
      const method = options?.method ?? 'GET'

      if (method === 'GET' && path === API_PATHS.broker.tenantCases.list) {
        return {
          success: true,
          message: 'ok',
          payload: {
            data: [],
            current_page: 1,
            per_page: 10,
            total: 0,
            last_page: 1,
          },
        }
      }
      if (method === 'GET' && path === API_PATHS.broker.tenantCases.detail(5)) {
        return {
          success: true,
          message: 'ok',
          payload: {
            id: 5,
            room_id: 1,
            room: { id: '1', category: '', floor: '1', name: 'X', area: 1 },
            current_tenant: 'T',
            responsible_id: 2,
            responsible: 'R',
            applicants: [],
            kp: { rows: [] },
          },
        }
      }
      if (method === 'POST' && path === API_PATHS.broker.tenantCases.list) {
        return { success: true, message: 'ok', payload: { id: 9 } }
      }
      if (method === 'PUT' && path === API_PATHS.broker.tenantCases.detail(5)) {
        return { success: true, message: 'ok', payload: { id: 5 } }
      }
      if (method === 'DELETE' && path === API_PATHS.broker.tenantCases.detail(5)) {
        return { success: true, message: 'ok' }
      }
      throw new Error(`unexpected ${method} ${request}`)
    })

    const cases = mountCases()
    await vi.waitFor(() => expect(cases.isLoading.value).toBe(false))

    await expect(cases.fetchTenantCase(5)).resolves.toMatchObject({ id: 5 })
    await expect(cases.createTenantCase(storePayload())).resolves.toEqual({ ok: true })
    await expect(cases.updateTenantCase(5, updatePayload())).resolves.toEqual({ ok: true })
    await expect(cases.deleteTenantCase(5)).resolves.toEqual({ ok: true })
  })
})
