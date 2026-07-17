import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { API_PATHS } from '#shared/constants/api'
import { AUTH_STORAGE_KEYS } from '#shared/constants/authStorage'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginSuccess } from '../helpers/authApi'
import { makeAccessToken, makeJwt } from '../helpers/jwt'
import { resetAuthClientState } from './resetAuthClientState'
import { useAuth } from '~/composables/useAuth'
import { useAuthToken } from '~/composables/useAuthToken'

const { fetchMock, navigateToMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  navigateToMock: vi.fn(async () => undefined),
}))

vi.stubGlobal(
  '$fetch',
  Object.assign(fetchMock, {
    create: vi.fn(() => fetchMock),
  }),
)

mockNuxtImport('navigateTo', () => navigateToMock)

describe('useAuth', () => {
  beforeEach(() => {
    resetAuthClientState(fetchMock, navigateToMock)
  })

  it('login stores access token and ignores JSON refresh_token', async () => {
    const access = makeAccessToken()
    fetchMock.mockResolvedValueOnce(loginSuccess(access))

    const { login, accessToken, isAuthenticated } = useAuth()
    await login({ email: 'a@b.ru', password: 'secret', remember: true })

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.broker.auth.login,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: { email: 'a@b.ru', password: 'secret' },
      }),
    )
    expect(accessToken.value).toBe(access)
    expect(isAuthenticated.value).toBe(true)
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBe(access)
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBeNull()
  })

  it('refresh is single-flight and persists new access token', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({ exp: Math.floor(Date.now() / 1000) - 10 }),
      remember: false,
    })

    let resolveRefresh!: (value: unknown) => void
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve
    })
    fetchMock.mockReturnValueOnce(refreshPromise)

    const { refresh, accessToken } = useAuth()
    const first = refresh()
    const second = refresh()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const nextAccess = makeAccessToken({ sub: 'refreshed' })
    resolveRefresh(loginSuccess(nextAccess))

    await expect(first).resolves.toBe(true)
    await expect(second).resolves.toBe(true)
    expect(accessToken.value).toBe(nextAccess)
  })

  it('failed refresh returns false without clearing tokens itself', async () => {
    const { persistTokens } = useAuthToken()
    const stale = makeAccessToken()
    persistTokens({ accessToken: stale, remember: false })

    fetchMock.mockRejectedValueOnce({ response: { status: 401 }, data: { message: 'nope' } })

    const { refresh, accessToken } = useAuth()
    await expect(refresh()).resolves.toBe(false)
    expect(accessToken.value).toBe(stale)
  })

  it('logout clears tokens even when API logout fails', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: true })

    fetchMock.mockRejectedValueOnce({ response: { status: 500 } })

    const { logout, accessToken } = useAuth()
    await logout()

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.broker.auth.logout,
      expect.objectContaining({ method: 'POST' }),
    )
    expect(accessToken.value).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull()
  })

  it('ensureSession returns true for non-expired access without refresh', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    const { ensureSession } = useAuth()
    await expect(ensureSession()).resolves.toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ensureSession refreshes expired access and clears on failure', async () => {
    const { persistTokens } = useAuthToken()
    const expired = makeJwt({
      sub: '1',
      exp: Math.floor(Date.now() / 1000) - 60,
    })
    persistTokens({ accessToken: expired, remember: false })

    fetchMock.mockRejectedValueOnce({ response: { status: 401 } })

    const { ensureSession, accessToken } = useAuth()
    await expect(ensureSession()).resolves.toBe(false)
    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.broker.auth.refresh,
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
    expect(accessToken.value).toBeNull()
  })

  it('logout without token skips API and still clears session', async () => {
    const { accessToken } = useAuthToken()
    const { logout } = useAuth()
    await logout()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(accessToken.value).toBeNull()
  })

  it('refresh with remember=true writes new access to localStorage', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({ exp: Math.floor(Date.now() / 1000) - 10 }),
      remember: true,
    })

    const nextAccess = makeAccessToken({ sub: 'remember-refresh' })
    fetchMock.mockResolvedValueOnce(loginSuccess(nextAccess))

    const { refresh } = useAuth()
    await expect(refresh()).resolves.toBe(true)

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBe(nextAccess)
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.remember)).toBe('1')
    expect(sessionStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull()
  })

  it('isolates refreshInFlight so a later refresh can hit the network again', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({ exp: Math.floor(Date.now() / 1000) - 10 }),
      remember: false,
    })

    fetchMock.mockRejectedValueOnce({ response: { status: 401 } })

    const { refresh } = useAuth()
    await expect(refresh()).resolves.toBe(false)

    const nextAccess = makeAccessToken({ sub: 'second-flight' })
    fetchMock.mockResolvedValueOnce(loginSuccess(nextAccess))

    await expect(refresh()).resolves.toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
