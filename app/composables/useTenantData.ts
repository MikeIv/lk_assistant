import { API_PATHS } from '#shared/constants/api'
import { TENANT_DATA_MOCK } from '#shared/constants/tenantDataMock'
import type { TenantDataInfo, TenantDataTabKey } from '#shared/types/tenantData'

/**
 * Данные арендатора для страницы «Мои данные».
 * Пока API не подключено — локальный mock из TENANT_DATA_MOCK.
 */
export function useTenantData() {
  const { isMockMode } = useApiConfig()

  const apiNotice = computed(() =>
    isMockMode.value
      ? null
      : `API \`${API_PATHS.tenants.data}\` пока не подключён — показаны mock-данные до согласования контракта.`,
  )

  const activeTab = ref<TenantDataTabKey>('general')
  const data = ref<TenantDataInfo>(structuredClone(TENANT_DATA_MOCK))

  return {
    activeTab,
    data,
    isMockMode,
    apiNotice,
  }
}
