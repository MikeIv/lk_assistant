import { joinApiUrl, normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'
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

/**
 * Императивный HTTP-клиент (`ofetch`) с `baseURL` из `runtimeConfig.public.apiBase`.
 * Cookies (refresh token) и Bearer access token подключаются автоматически.
 */
export function useApi() {
  const baseURL = normalizeApiBaseUrl(useRuntimeConfig().public.apiBase)
  const { accessToken } = useAuthToken()

  return $fetch.create({
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
}

/**
 * Реактивный `useFetch` к тому же API, что и {@link useApi}: URL собирается из `apiBase` + путь.
 * Второй аргумент — без `baseURL` и без дженерика на `UseFetchOptions` (ограничение типов Nuxt 4);
 * тип ответа задаётся параметром `T` у возвращаемого `AsyncData<T, …>`.
 */
export function useApiFetch<T = unknown>(
  path: MaybeRefOrGetter<string>,
  options?: Omit<UseFetchOptions<unknown>, 'baseURL'>,
): AsyncData<T, FetchError | null> {
  const config = useRuntimeConfig()
  const { accessToken } = useAuthToken()
  const userOnRequest = options?.onRequest

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
