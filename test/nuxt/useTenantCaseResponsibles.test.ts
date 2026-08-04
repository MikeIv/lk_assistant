import { API_PATHS } from '#shared/constants/api'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { networkError } from '../helpers/domainApiMock'
import { runComposable } from '../helpers/runComposable'
import { useTenantCaseResponsibles } from '~/composables/useTenantCaseResponsibles'

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

describe('useTenantCaseResponsibles', () => {
  beforeEach(() => {
    apiMock.mockReset()
    mockMode.value = true
  })

  afterEach(() => {
    while (unmounts.length) {
      unmounts.pop()?.()
    }
  })

  function mountResponsibles() {
    const { result, unmount } = runComposable(() => useTenantCaseResponsibles())
    unmounts.push(unmount)
    return result
  }

  it('mock mode returns empty list without API call', async () => {
    const responsibles = mountResponsibles()
    const items = await responsibles.fetchResponsibles({ roomId: 3 })

    expect(items).toEqual([])
    expect(responsibles.items.value).toEqual([])
    expect(apiMock).not.toHaveBeenCalled()
  })

  it('api: fetches responsibles with room_id and tenant_case_id', async () => {
    mockMode.value = false
    apiMock.mockResolvedValueOnce({
      success: true,
      message: 'OK',
      payload: [
        { id: 1, responsible: 'Петров Иван' },
        { id: 2, responsible: 'Сидорова Анна' },
      ],
    })

    const responsibles = mountResponsibles()
    const items = await responsibles.fetchResponsibles({ roomId: 9, tenantCaseId: 4 })

    expect(apiMock).toHaveBeenCalledWith(
      `${API_PATHS.broker.tenantCases.responsibles}?room_id=9&tenant_case_id=4`,
    )
    expect(items).toHaveLength(2)
    expect(responsibles.items.value[0]?.responsible).toBe('Петров Иван')
  })

  it('api: sets error and clears items on failure', async () => {
    mockMode.value = false
    apiMock.mockRejectedValueOnce(networkError())

    const responsibles = mountResponsibles()
    const items = await responsibles.fetchResponsibles({ roomId: 1 })

    expect(items).toEqual([])
    expect(responsibles.error.value).toBe('Не удалось загрузить список ответственных')
  })
})
