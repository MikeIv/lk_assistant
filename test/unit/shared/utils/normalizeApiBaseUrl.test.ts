import { describe, expect, it } from 'vitest'
import { joinApiUrl, normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'

describe('normalizeApiBaseUrl / joinApiUrl', () => {
  it('normalizes base URL', () => {
    expect(normalizeApiBaseUrl(null)).toBeUndefined()
    expect(normalizeApiBaseUrl('   ')).toBeUndefined()
    expect(normalizeApiBaseUrl(' https://api.test/ ')).toBe('https://api.test')
    expect(normalizeApiBaseUrl('https://api.test///')).toBe('https://api.test')
  })

  it('joins base and path without double slashes', () => {
    expect(joinApiUrl('', 'rooms')).toBe('/rooms')
    expect(joinApiUrl('https://api.test', '/rooms')).toBe('https://api.test/rooms')
    expect(joinApiUrl('https://api.test/', 'rooms')).toBe('https://api.test/rooms')
  })
})
