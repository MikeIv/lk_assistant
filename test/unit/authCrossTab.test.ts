import { describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEYS } from '#shared/constants/authStorage'
import { isCrossTabAuthLogoutEvent } from '#shared/utils/authCrossTab'

describe('isCrossTabAuthLogoutEvent', () => {
  it('detects cleared auth keys when event is from localStorage', () => {
    expect(
      isCrossTabAuthLogoutEvent({ key: AUTH_STORAGE_KEYS.accessToken, newValue: null }, true),
    ).toBe(true)

    expect(
      isCrossTabAuthLogoutEvent({ key: AUTH_STORAGE_KEYS.remember, newValue: null }, true),
    ).toBe(true)
  })

  it('detects full localStorage clear (key === null)', () => {
    expect(isCrossTabAuthLogoutEvent({ key: null, newValue: null }, true)).toBe(true)
  })

  it('ignores unrelated keys, value updates, and non-localStorage events', () => {
    expect(
      isCrossTabAuthLogoutEvent(
        { key: AUTH_STORAGE_KEYS.accessToken, newValue: 'still-there' },
        true,
      ),
    ).toBe(false)

    expect(isCrossTabAuthLogoutEvent({ key: 'other.key', newValue: null }, true)).toBe(false)

    expect(
      isCrossTabAuthLogoutEvent({ key: AUTH_STORAGE_KEYS.accessToken, newValue: null }, false),
    ).toBe(false)
  })
})
