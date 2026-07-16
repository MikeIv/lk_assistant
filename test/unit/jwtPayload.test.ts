import { describe, expect, it, vi, afterEach } from 'vitest'
import { decodeJwtPayload, isAccessTokenExpired } from '#shared/utils/jwtPayload'
import { makeJwt } from '../helpers/jwt'

describe('decodeJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const token = makeJwt({ sub: '1', role_id: 2, exp: 1_700_000_000 })
    expect(decodeJwtPayload(token)).toEqual({
      sub: '1',
      role_id: 2,
      exp: 1_700_000_000,
    })
  })

  it('returns null for malformed tokens', () => {
    expect(decodeJwtPayload('')).toBeNull()
    expect(decodeJwtPayload('only-one-part')).toBeNull()
    expect(decodeJwtPayload('a.!!!not-base64!!!.c')).toBeNull()
  })

  it('returns null when payload is not a JSON object', () => {
    const body = Buffer.from('"string-payload"').toString('base64url')
    expect(decodeJwtPayload(`hdr.${body}.sig`)).toBeNull()
  })
})

describe('isAccessTokenExpired', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true when exp is missing', () => {
    expect(isAccessTokenExpired(makeJwt({ sub: '1' }))).toBe(true)
  })

  it('returns true when token is past exp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'))
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) - 10 })
    expect(isAccessTokenExpired(token, 0)).toBe(true)
  })

  it('returns true within skew window before exp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'))
    const nowSec = Math.floor(Date.now() / 1000)
    const token = makeJwt({ exp: nowSec + 20 })
    expect(isAccessTokenExpired(token, 30)).toBe(true)
    expect(isAccessTokenExpired(token, 0)).toBe(false)
  })

  it('returns false for a fresh token', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'))
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 })
    expect(isAccessTokenExpired(token)).toBe(false)
  })
})
