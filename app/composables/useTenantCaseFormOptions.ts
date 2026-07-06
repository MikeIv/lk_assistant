import { API_PATHS } from '#shared/constants/api'
import { APPLICANTS_MOCK_ITEMS } from '#shared/constants/applicantsMock'
import { PREMISES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import type { Applicant, ApplicantsListApiResponse } from '#shared/types/applicants'
import type { Premise, PremisesListApiResponse } from '#shared/types/premises'
import { normalizeApplicant } from '#shared/utils/applicantsNormalize'
import { normalizePremise } from '#shared/utils/premisesNormalize'
import { useApiConfig } from '~/composables/useApiConfig'

const FORM_OPTIONS_PER_PAGE = 1000

/** Справочники для формы карточки дела: помещения и претенденты. */
export function useTenantCaseFormOptions() {
  const api = useApi()
  const { isMockMode } = useApiConfig()

  const rooms = ref<Premise[]>([])
  const applicants = ref<Applicant[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadOptions() {
    isLoading.value = true
    error.value = null

    try {
      if (isMockMode.value) {
        rooms.value = PREMISES_MOCK_ITEMS.slice(0, 120)
        applicants.value = APPLICANTS_MOCK_ITEMS
        return
      }

      const [roomsResponse, applicantsResponse] = await Promise.all([
        api<PremisesListApiResponse>(API_PATHS.broker.rooms.list),
        api<ApplicantsListApiResponse>(
          `${API_PATHS.broker.tenantApplicants.list}?per_page=${FORM_OPTIONS_PER_PAGE}`,
        ),
      ])

      rooms.value = (roomsResponse.payload.items ?? []).map(normalizePremise)
      applicants.value = (applicantsResponse.payload.data ?? []).map(normalizeApplicant)
    } catch {
      error.value = 'Не удалось загрузить справочники для формы'
      rooms.value = []
      applicants.value = []
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void loadOptions()
  })

  return {
    rooms,
    applicants,
    isLoading,
    error,
    reload: loadOptions,
  }
}
