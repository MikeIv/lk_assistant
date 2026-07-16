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
    create: vi.fn(() => apiFetchMock),
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
})
