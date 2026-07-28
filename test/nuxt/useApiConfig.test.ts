import { describe, expect, it } from 'vitest'
import { useApiConfig } from '~/composables/useApiConfig'

describe('useApiConfig', () => {
  it('exposes normalized apiBase and mock mode from runtimeConfig', () => {
    const { apiBase, isMockMode, apiDocsUrl } = useApiConfig()

    expect(apiBase.value).toBe('https://api.test')
    expect(isMockMode.value).toBe(false)
    expect(apiDocsUrl).toContain('broker')
  })
})
