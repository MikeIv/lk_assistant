import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginSuccess } from '../helpers/authApi'
import { makeAccessToken } from '../helpers/jwt'
import { resetAuthClientState } from './resetAuthClientState'
import { useApi } from '~/composables/useApi'
import { useAuthToken } from '~/composables/useAuthToken'

const { authFetchMock, apiFetchMock, navigateToMock } = vi.hoisted(() => ({
  authFetchMock: vi.fn(),
  apiFetchMock: vi.fn(),
  navigateToMock: vi.fn(async () => undefined),
}))

vi.stubGlobal(
  '$fetch',
  Object.assign(authFetchMock, {
    create: vi.fn(
      (defaults: { onRequest?: (ctx: { options: Record<string, unknown> }) => void }) => {
        return (request: string, options: Record<string, unknown> = {}) => {
          const nextOptions = { ...options }
          defaults?.onRequest?.({ options: nextOptions })
          return apiFetchMock(request, nextOptions)
        }
      },
    ),
  }),
)

mockNuxtImport('navigateTo', () => navigateToMock)

function unauthorizedError() {
  return {
    response: { status: 401 },
    statusCode: 401,
    data: { message: 'Unauthorized' },
  }
}

describe('useApi 401 recovery', () => {
  beforeEach(() => {
    resetAuthClientState(authFetchMock, apiFetchMock, navigateToMock)
  })

  it('retries once after successful silent refresh', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    apiFetchMock.mockRejectedValueOnce(unauthorizedError()).mockResolvedValueOnce({ ok: true })
    authFetchMock.mockResolvedValueOnce(loginSuccess(makeAccessToken({ sub: 'after-refresh' })))

    const api = useApi()
    await expect(api('/v1/broker/legal-entities')).resolves.toEqual({ ok: true })

    expect(apiFetchMock).toHaveBeenCalledTimes(2)
    expect(authFetchMock).toHaveBeenCalledWith(
      '/v1/broker/auth/refresh',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('does not refresh on broker auth paths and rethrows 401', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    apiFetchMock.mockRejectedValueOnce(unauthorizedError())

    const api = useApi()
    await expect(api('/v1/broker/auth/login')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(authFetchMock).not.toHaveBeenCalled()
    expect(apiFetchMock).toHaveBeenCalledTimes(1)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('clears session and redirects to login when refresh fails', async () => {
    const { persistTokens, accessToken } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: true })

    apiFetchMock.mockRejectedValueOnce(unauthorizedError())
    authFetchMock.mockRejectedValueOnce(unauthorizedError())

    const api = useApi()
    await expect(api('/v1/broker/legal-entities')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(accessToken.value).toBeNull()
    expect(navigateToMock).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('rethrows second 401 after successful refresh without redirect', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    apiFetchMock
      .mockRejectedValueOnce(unauthorizedError())
      .mockRejectedValueOnce(unauthorizedError())
    authFetchMock.mockResolvedValueOnce(loginSuccess(makeAccessToken({ sub: 'after-refresh' })))

    const api = useApi()
    await expect(api('/v1/broker/legal-entities')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(apiFetchMock).toHaveBeenCalledTimes(2)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('dedupes redirectToLogin when parallel requests fail refresh', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    apiFetchMock.mockRejectedValue(unauthorizedError())
    authFetchMock.mockRejectedValue(unauthorizedError())

    const api = useApi()
    await Promise.allSettled([api('/v1/broker/legal-entities'), api('/v1/broker/counterparties')])

    expect(navigateToMock).toHaveBeenCalledTimes(1)
    expect(navigateToMock).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('passes non-401 errors through without refresh or redirect', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({ accessToken: makeAccessToken(), remember: false })

    apiFetchMock.mockRejectedValueOnce({
      response: { status: 500 },
      statusCode: 500,
      data: { message: 'boom' },
    })

    const api = useApi()
    await expect(api('/v1/broker/legal-entities')).rejects.toMatchObject({
      response: { status: 500 },
    })

    expect(authFetchMock).not.toHaveBeenCalled()
    expect(apiFetchMock).toHaveBeenCalledTimes(1)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('retries with Authorization Bearer from refreshed access token', async () => {
    const { persistTokens } = useAuthToken()
    const stale = makeAccessToken({ sub: 'stale' })
    const fresh = makeAccessToken({ sub: 'fresh' })
    persistTokens({ accessToken: stale, remember: false })

    apiFetchMock.mockRejectedValueOnce(unauthorizedError()).mockResolvedValueOnce({ ok: true })
    authFetchMock.mockResolvedValueOnce(loginSuccess(fresh))

    const api = useApi()
    await expect(api('/v1/broker/legal-entities')).resolves.toEqual({ ok: true })

    const retryHeaders = apiFetchMock.mock.calls[1]?.[1]?.headers as Headers
    expect(retryHeaders.get('Authorization')).toBe(`Bearer ${fresh}`)
  })
})
