import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { API_PATHS } from '#shared/constants/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginSuccess } from '../helpers/authApi'
import { makeAccessToken, makeJwt } from '../helpers/jwt'
import { resetAuthClientState } from './resetAuthClientState'
import authMiddleware from '~/middleware/auth.global'
import { useAuthToken } from '~/composables/useAuthToken'
import type { RouteLocationNormalized } from 'vue-router'

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

function route(path: string): RouteLocationNormalized {
  return { path } as RouteLocationNormalized
}

describe('auth.global middleware', () => {
  beforeEach(() => {
    resetAuthClientState(fetchMock, navigateToMock)
  })

  it('does not refresh for anonymous visitor on /login', async () => {
    await authMiddleware(route('/login'), route('/'))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('redirects anonymous visitor from protected route to /login', async () => {
    fetchMock.mockRejectedValueOnce({ response: { status: 401 } })

    await authMiddleware(route('/broker'), route('/'))

    expect(navigateToMock).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('triggers ensureSession/refresh on /login when remember is set', async () => {
    useState<boolean>('api.remember', () => false).value = true
    useState<boolean>('api.authHydrated', () => false).value = true

    fetchMock.mockRejectedValueOnce({ response: { status: 401 } })

    await authMiddleware(route('/login'), route('/'))

    expect(fetchMock).toHaveBeenCalledWith(
      API_PATHS.broker.auth.refresh,
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('redirects authenticated user away from /login to /', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    await authMiddleware(route('/login'), route('/'))

    expect(navigateToMock).toHaveBeenCalledWith('/', { replace: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows authenticated user on protected route without redirect', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    const result = await authMiddleware(route('/broker'), route('/'))

    expect(result).toBeUndefined()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows access when expired access refreshes successfully', async () => {
    const { persistTokens, accessToken } = useAuthToken()
    const expired = makeJwt({
      sub: '1',
      exp: Math.floor(Date.now() / 1000) - 60,
    })
    persistTokens({ accessToken: expired, remember: false })

    const nextAccess = makeAccessToken({ sub: 'refreshed' })
    fetchMock.mockResolvedValueOnce(loginSuccess(nextAccess))

    const result = await authMiddleware(route('/broker'), route('/'))

    expect(result).toBeUndefined()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(accessToken.value).toBe(nextAccess)
  })
})
