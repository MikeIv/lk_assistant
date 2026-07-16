/** Сброс useState + browser storage между Nuxt-тестами auth. */
export function resetAuthClientState(
  ...mocks: Array<{ mockReset?: () => void; mockClear?: () => void }>
) {
  clearNuxtState(['api.accessToken', 'api.remember', 'api.authHydrated'])
  localStorage.clear()
  sessionStorage.clear()

  for (const mock of mocks) {
    mock.mockReset?.()
    mock.mockClear?.()
  }
}
