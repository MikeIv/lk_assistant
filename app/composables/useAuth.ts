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
 * Refresh — HttpOnly cookie `refresh_token` (POST без body, `credentials: 'include'`).
 * Auth-запросы идут через сырой `$fetch` (без 401-retry из {@link useApi}), чтобы не зациклиться.
 */
export function useAuth() {
  const baseURL = normalizeApiBaseUrl(useRuntimeConfig().public.apiBase)
  const { accessToken, remember, hydrateFromStorage, persistTokens, clearTokens } = useAuthToken()

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

  function applyAccessToken(payload: LoginResponse, rememberMe: boolean) {
    persistTokens({
      accessToken: payload.access_token,
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

    // refresh_token в JSON игнорируем — бэкенд кладёт его в HttpOnly cookie.
    applyAccessToken(response.payload, rememberMe)
  }

  /** Silent refresh через HttpOnly cookie (без JS-хранения refresh). */
  async function refresh(): Promise<boolean> {
    hydrateFromStorage()

    if (refreshInFlight) {
      return refreshInFlight
    }

    refreshInFlight = (async () => {
      try {
        const response = await authFetch<ApiSuccessResponse<LoginResponse>>(
          API_PATHS.broker.auth.refresh,
          {
            method: 'POST',
          },
        )

        applyAccessToken(response.payload, remember.value)
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

  /**
   * Восстановить access: из storage или через cookie-refresh.
   * Без access всегда пробуем refresh (cookie может быть валидна без JS-токенов).
   */
  async function ensureSession(): Promise<boolean> {
    hydrateFromStorage()

    if (accessToken.value) {
      return true
    }

    const ok = await refresh()
    if (!ok) {
      clearTokens()
    }
    return ok
  }

  return {
    accessToken,
    isAuthenticated,
    login,
    logout,
    refresh,
    ensureSession,
    clearSession: clearTokens,
    hydrateFromStorage,
  }
}
