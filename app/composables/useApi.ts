import { joinApiUrl, normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'
import { useAuth } from '~/composables/useAuth'
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

  async function apiFetch<T = unknown>(request: string, options?: FetchOptions): Promise<T> {
    try {
      return await rawFetch<T>(request, options as never)
    } catch (error) {
      if (!isUnauthorized(error) || isBrokerAuthPath(request) || !import.meta.client) {
        throw error
      }

      const refreshed = await refresh()
      if (!refreshed) {
        clearTokens()
        await navigateTo('/login')
        throw error
      }

      return await rawFetch<T>(request, options as never)
    }
  }

  return apiFetch as typeof rawFetch
}

/**
 * Реактивный `useFetch` к тому же API, что и {@link useApi}: URL собирается из `apiBase` + путь.
 * Второй аргумент — без `baseURL` и без дженерика на `UseFetchOptions` (ограничение типов Nuxt 4);
 * тип ответа задаётся параметром `T` у возвращаемого `AsyncData<T, …>`.
 * Silent refresh при 401 — в императивном {@link useApi}.
 */
export function useApiFetch<T = unknown>(
  path: MaybeRefOrGetter<string>,
  options?: Omit<UseFetchOptions<unknown>, 'baseURL'>,
): AsyncData<T, FetchError | null> {
  const config = useRuntimeConfig()
  const { accessToken, hydrateFromStorage } = useAuthToken()
  const userOnRequest = options?.onRequest

  hydrateFromStorage()

  const request = computed(() => joinApiUrl(config.public.apiBase, String(toValue(path))))

  return useFetch(request, {
    ...options,
    credentials: 'include',
    onRequest(ctx) {
      withApiAuthHeaders(ctx.options, accessToken.value)

      if (typeof userOnRequest === 'function') {
        userOnRequest(ctx)
      }
    },
  }) as AsyncData<T, FetchError | null>
}
