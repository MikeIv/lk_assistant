import { describe, expect, it } from 'vitest'
import { getReportRequestHeaders } from '#shared/utils/reportsApiHeaders'

describe('getReportRequestHeaders', () => {
  it('omits Contract-id when contractId is empty in runtimeConfig', () => {
    expect(getReportRequestHeaders()).toEqual({})
  })

  it('sets Contract-id when runtimeConfig.public.contractId is set', () => {
    const config = useRuntimeConfig()
    const prev = config.public.contractId
    config.public.contractId = '42'

    try {
      expect(getReportRequestHeaders()).toEqual({ 'Contract-id': '42' })
    } finally {
      config.public.contractId = prev
    }
  })
})
