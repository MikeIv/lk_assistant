import { normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'
import { redirectToLogin, useAuth } from '~/composables/useAuth'
import { useAuthToken } from '~/composables/useAuthToken'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { FetchError, FetchOptions } from 'ofetch'

function withApiAuthHeaders(options: FetchOptions, accessToken: string | null): void {
  options.credentials ??= 'include'

  if (!accessToken) {
    return
  }

  const headers = new Headers(options.headers as HeadersInit | undefined)
  headers.set('Authorization', `Bearer ${accessToken}`)
  options.headers = headers
}

function isUnauthorized(error: unknown): error is FetchError {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as FetchError).response?.status === 401,
  )
}

function isBrokerAuthPath(path: string): boolean {
  return path.includes('/v1/broker/auth/')
}

/**
 * Императивный HTTP-клиент (`ofetch`) с `baseURL` из `runtimeConfig.public.apiBase`.
 * Bearer access token из {@link useAuthToken}; при 401 — silent refresh и один повтор запроса.
 * Безопасен для защищённых данных (тот же 401-путь, что у {@link useApiFetch}).
 */
export function useApi() {
  const baseURL = normalizeApiBaseUrl(useRuntimeConfig().public.apiBase)
  const { accessToken, hydrateFromStorage, clearTokens } = useAuthToken()
  const { refresh } = useAuth()

  hydrateFromStorage()

  const rawFetch = $fetch.create({
    baseURL,
    credentials: 'include',
    onRequest({ options }) {
      withApiAuthHeaders(options, accessToken.value)
    },
    onResponseError(ctx) {
      if (import.meta.dev) {
        console.error('[useApi]', String(ctx.request), ctx.response.status, ctx.response._data)
      }
    },
  })

  async function recoverFromUnauthorized(request: string): Promise<boolean> {
    if (!import.meta.client || isBrokerAuthPath(request)) {
      return false
    }

    const refreshed = await refresh()
    if (!refreshed) {
      clearTokens()
      await redirectToLogin()
      return false
    }

    return true
  }

  async function apiFetch<T = unknown>(request: string, options?: FetchOptions): Promise<T> {
    try {
      return await rawFetch<T>(request, options as never)
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error
      }

      const canRetry = await recoverFromUnauthorized(request)
      if (!canRetry) {
        throw error
      }

      return await rawFetch<T>(request, options as never)
    }
  }

  return apiFetch as typeof rawFetch
}

/**
 * Реактивный `useFetch` к тому же API и с тем же 401 → refresh → retry, что {@link useApi}.
 * Путь — относительный (как у `useApi`); `baseURL` берётся из клиента.
 */
export function useApiFetch<T = unknown>(
  path: MaybeRefOrGetter<string>,
  options?: Omit<UseFetchOptions<unknown>, 'baseURL' | '$fetch'>,
): AsyncData<T, FetchError | null> {
  const api = useApi()

  return useFetch(path, {
    ...options,
    $fetch: api as typeof $fetch,
  }) as AsyncData<T, FetchError | null>
}
