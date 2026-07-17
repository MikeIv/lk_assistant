import { resetAuthInFlightForTests } from '~/composables/useAuth'
import { resetCrossTabLogoutForTests } from '~/composables/useAuthToken'
import { resetCabinetRoleWatchForTests } from '~/composables/useCabinetRole'

/** Сброс useState + browser storage + модульных синглтонов между Nuxt-тестами auth. */
export function resetAuthClientState(
  ...mocks: Array<{ mockReset?: () => void; mockClear?: () => void }>
) {
  clearNuxtState([
    'api.accessToken',
    'api.remember',
    'api.authHydrated',
    'cabinet-role',
    'cabinet-role-label',
    'cabinet-full-name',
  ])
  localStorage.clear()
  sessionStorage.clear()

  resetCrossTabLogoutForTests()
  resetAuthInFlightForTests()
  resetCabinetRoleWatchForTests()

  for (const mock of mocks) {
    mock.mockReset?.()
    mock.mockClear?.()
  }
}
