import { API_DOCS_URL } from '#shared/constants/api'
import { normalizeApiBaseUrl } from '#shared/utils/normalizeApiBaseUrl'

/** Публичная конфигурация API из `runtimeConfig` + дефолты из OpenAPI. */
export function useApiConfig() {
  const config = useRuntimeConfig()

  const apiBase = computed(() => normalizeApiBaseUrl(config.public.apiBase))
  const isMockMode = computed(() => !apiBase.value)

  return {
    apiBase,
    isMockMode,
    apiDocsUrl: API_DOCS_URL,
  }
}
