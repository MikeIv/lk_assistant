import { API_PATHS } from '#shared/constants/api'
import type { ApiSuccessResponse, LoginRequest, LoginResponse } from '#shared/types/api'
import { normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'
import { useAuthToken } from '~/composables/useAuthToken'
import type { FetchError } from 'ofetch'

let refreshInFlight: Promise<boolean> | null = null

function isFetchError(error: unknown): error is FetchError {
  return Boolean(error && typeof error === 'object' && 'response' in error)
}

/**
 * Сессия брокера: login / logout / refresh / ensureSession.
 * Auth-запросы идут через сырой `$fetch` (без 401-retry из {@link useApi}), чтобы не зациклиться.
 */
export function useAuth() {
  const baseURL = normalizeApiBaseUrl(useRuntimeConfig().public.apiBase)
  const { accessToken, refreshToken, remember, hydrateFromStorage, persistTokens, clearTokens } =
    useAuthToken()

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function authFetch<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: Record<string, unknown> | LoginRequest
      headers?: Record<string, string>
    } = {},
  ) {
    return $fetch<T>(path, {
      baseURL,
      credentials: 'include',
      ...options,
    })
  }

  function applyTokens(payload: LoginResponse, rememberMe: boolean) {
    persistTokens({
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      remember: rememberMe,
    })
  }

  async function login(input: LoginRequest & { remember?: boolean }): Promise<void> {
    const rememberMe = Boolean(input.remember)
    const response = await authFetch<ApiSuccessResponse<LoginResponse>>(
      API_PATHS.broker.auth.login,
      {
        method: 'POST',
        body: {
          email: input.email,
          password: input.password,
        } satisfies LoginRequest,
      },
    )

    applyTokens(response.payload, rememberMe)
  }

  async function refresh(): Promise<boolean> {
    hydrateFromStorage()

    const token = refreshToken.value
    if (!token) {
      return false
    }

    if (refreshInFlight) {
      return refreshInFlight
    }

    refreshInFlight = (async () => {
      try {
        const response = await authFetch<ApiSuccessResponse<LoginResponse>>(
          API_PATHS.broker.auth.refresh,
          {
            method: 'POST',
            body: { refresh_token: token },
          },
        )

        applyTokens(response.payload, remember.value)
        return true
      } catch (error) {
        if (import.meta.dev && isFetchError(error)) {
          console.error('[useAuth.refresh]', error.response?.status, error.data)
        }
        return false
      } finally {
        refreshInFlight = null
      }
    })()

    return refreshInFlight
  }

  async function logout(): Promise<void> {
    hydrateFromStorage()
    const token = accessToken.value

    try {
      if (token) {
        await authFetch(API_PATHS.broker.auth.logout, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (error) {
      if (import.meta.dev && isFetchError(error)) {
        console.error('[useAuth.logout]', error.response?.status, error.data)
      }
    } finally {
      clearTokens()
    }
  }

  /** Восстановить access через refresh, если в storage есть refresh_token. */
  async function ensureSession(): Promise<boolean> {
    hydrateFromStorage()

    if (accessToken.value) {
      return true
    }

    if (!refreshToken.value) {
      return false
    }

    return refresh()
  }

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    logout,
    refresh,
    ensureSession,
    clearSession: clearTokens,
    hydrateFromStorage,
  }
}
