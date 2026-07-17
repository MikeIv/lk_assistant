import { AUTH_STORAGE_KEYS } from '#shared/constants/authStorage'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetAuthClientState } from './resetAuthClientState'
import { useAuthToken } from '~/composables/useAuthToken'

describe('useAuthToken', () => {
  beforeEach(() => {
    resetAuthClientState()
  })

  it('persists access token to sessionStorage when remember is false', () => {
    const { persistTokens, accessToken, remember } = useAuthToken()

    persistTokens({ accessToken: 'access-session', remember: false })

    expect(accessToken.value).toBe('access-session')
    expect(remember.value).toBe(false)
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBe('access-session')
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.remember)).toBeNull()
  })

  it('persists access token to localStorage when remember is true', () => {
    const { persistTokens, accessToken, remember } = useAuthToken()

    persistTokens({ accessToken: 'access-local', remember: true })

    expect(accessToken.value).toBe('access-local')
    expect(remember.value).toBe(true)
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBe('access-local')
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.remember)).toBe('1')
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull()
  })

  it('hydrates from localStorage when remember flag is set', () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.remember, '1')
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, 'from-local')
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'legacy-refresh')

    const { hydrateFromStorage, accessToken, remember } = useAuthToken()
    hydrateFromStorage()

    expect(accessToken.value).toBe('from-local')
    expect(remember.value).toBe(true)
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBeNull()
  })

  it('hydrates from sessionStorage when remember flag is absent', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.accessToken, 'from-session')
    sessionStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'legacy-session-refresh')

    const { hydrateFromStorage, accessToken, remember } = useAuthToken()
    hydrateFromStorage()

    expect(accessToken.value).toBe('from-session')
    expect(remember.value).toBe(false)
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBeNull()
  })

  it('clears both storages and in-memory token', () => {
    const { persistTokens, clearTokens, accessToken, remember } = useAuthToken()
    persistTokens({ accessToken: 'to-clear', remember: true })

    clearTokens()

    expect(accessToken.value).toBeNull()
    expect(remember.value).toBe(false)
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.remember)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull()
  })
})

describe('useAuthToken.bindCrossTabLogout', () => {
  beforeEach(() => {
    resetAuthClientState()
  })

  it('clears in-memory session and calls onLogout on localStorage auth clear', () => {
    const onLogout = vi.fn()
    const { persistTokens, bindCrossTabLogout, accessToken, remember } = useAuthToken()
    persistTokens({ accessToken: 'tab-access', remember: true })
    bindCrossTabLogout(onLogout)

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: AUTH_STORAGE_KEYS.accessToken,
        newValue: null,
        storageArea: localStorage,
      }),
    )

    expect(accessToken.value).toBeNull()
    expect(remember.value).toBe(false)
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('ignores unrelated storage keys', () => {
    const onLogout = vi.fn()
    const { persistTokens, bindCrossTabLogout, accessToken } = useAuthToken()
    persistTokens({ accessToken: 'keep-me', remember: true })
    bindCrossTabLogout(onLogout)

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'other',
        newValue: null,
        storageArea: localStorage,
      }),
    )

    expect(accessToken.value).toBe('keep-me')
    expect(onLogout).not.toHaveBeenCalled()
  })

  it('ignores sessionStorage events', () => {
    const onLogout = vi.fn()
    const { persistTokens, bindCrossTabLogout, accessToken } = useAuthToken()
    persistTokens({ accessToken: 'session-keep', remember: false })
    bindCrossTabLogout(onLogout)

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: AUTH_STORAGE_KEYS.accessToken,
        newValue: null,
        storageArea: sessionStorage,
      }),
    )

    expect(accessToken.value).toBe('session-keep')
    expect(onLogout).not.toHaveBeenCalled()
  })

  it('binds the storage listener only once', () => {
    const onLogout = vi.fn()
    const { persistTokens, bindCrossTabLogout } = useAuthToken()
    persistTokens({ accessToken: 'once', remember: true })

    bindCrossTabLogout(onLogout)
    bindCrossTabLogout(onLogout)

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: AUTH_STORAGE_KEYS.accessToken,
        newValue: null,
        storageArea: localStorage,
      }),
    )

    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
