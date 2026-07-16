import { AUTH_STORAGE_KEYS } from '#shared/constants/authStorage'

const ACCESS_TOKEN_STATE_KEY = 'api.accessToken'
const REFRESH_TOKEN_STATE_KEY = 'api.refreshToken'
const REMEMBER_STATE_KEY = 'api.remember'
const HYDRATED_STATE_KEY = 'api.authHydrated'

function storageGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function storageSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    /* quota / private mode */
  }
}

function storageRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function clearAuthKeys(storage: Storage): void {
  storageRemove(storage, AUTH_STORAGE_KEYS.accessToken)
  storageRemove(storage, AUTH_STORAGE_KEYS.refreshToken)
  storageRemove(storage, AUTH_STORAGE_KEYS.remember)
}

/**
 * JWT Access / Refresh для `Authorization: Bearer`.
 * Persistence: sessionStorage (по умолчанию) или localStorage («Запомнить меня»).
 */
export function useAuthToken() {
  const accessToken = useState<string | null>(ACCESS_TOKEN_STATE_KEY, () => null)
  const refreshToken = useState<string | null>(REFRESH_TOKEN_STATE_KEY, () => null)
  const remember = useState<boolean>(REMEMBER_STATE_KEY, () => false)
  const hydrated = useState<boolean>(HYDRATED_STATE_KEY, () => false)

  function hydrateFromStorage() {
    if (!import.meta.client || hydrated.value) {
      return
    }

    const fromLocal = storageGet(localStorage, AUTH_STORAGE_KEYS.remember) === '1'
    const storage = fromLocal ? localStorage : sessionStorage
    const access = storageGet(storage, AUTH_STORAGE_KEYS.accessToken)
    const refresh = storageGet(storage, AUTH_STORAGE_KEYS.refreshToken)

    if (access || refresh) {
      accessToken.value = access
      refreshToken.value = refresh
      remember.value = fromLocal
    }

    hydrated.value = true
  }

  function persistTokens(tokens: { accessToken: string; refreshToken: string; remember: boolean }) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    remember.value = tokens.remember
    hydrated.value = true

    if (!import.meta.client) {
      return
    }

    if (tokens.remember) {
      clearAuthKeys(sessionStorage)
      storageSet(localStorage, AUTH_STORAGE_KEYS.accessToken, tokens.accessToken)
      storageSet(localStorage, AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken)
      storageSet(localStorage, AUTH_STORAGE_KEYS.remember, '1')
      return
    }

    clearAuthKeys(localStorage)
    storageSet(sessionStorage, AUTH_STORAGE_KEYS.accessToken, tokens.accessToken)
    storageSet(sessionStorage, AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken)
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    remember.value = false
    hydrated.value = true

    if (!import.meta.client) {
      return
    }

    clearAuthKeys(localStorage)
    clearAuthKeys(sessionStorage)
  }

  return {
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    remember: readonly(remember),
    hydrateFromStorage,
    persistTokens,
    clearTokens,
  }
}
