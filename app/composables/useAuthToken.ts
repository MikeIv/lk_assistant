import { AUTH_STORAGE_KEYS } from '#shared/constants/authStorage'

const ACCESS_TOKEN_STATE_KEY = 'api.accessToken'
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

/** Чистит access/remember и устаревший JS refresh (миграция со wave-0 storage). */
function clearAuthKeys(storage: Storage): void {
  storageRemove(storage, AUTH_STORAGE_KEYS.accessToken)
  storageRemove(storage, AUTH_STORAGE_KEYS.refreshToken)
  storageRemove(storage, AUTH_STORAGE_KEYS.remember)
}

/**
 * Access JWT для `Authorization: Bearer`.
 * Refresh — только HttpOnly cookie `refresh_token` (не в JS-storage).
 * Persistence access: sessionStorage или localStorage («Запомнить меня»).
 */
export function useAuthToken() {
  const accessToken = useState<string | null>(ACCESS_TOKEN_STATE_KEY, () => null)
  const remember = useState<boolean>(REMEMBER_STATE_KEY, () => false)
  const hydrated = useState<boolean>(HYDRATED_STATE_KEY, () => false)

  function hydrateFromStorage() {
    if (!import.meta.client || hydrated.value) {
      return
    }

    const fromLocal = storageGet(localStorage, AUTH_STORAGE_KEYS.remember) === '1'
    const storage = fromLocal ? localStorage : sessionStorage
    const access = storageGet(storage, AUTH_STORAGE_KEYS.accessToken)

    // Удалить legacy refresh из JS-storage (контракт: только cookie).
    storageRemove(localStorage, AUTH_STORAGE_KEYS.refreshToken)
    storageRemove(sessionStorage, AUTH_STORAGE_KEYS.refreshToken)

    if (access) {
      accessToken.value = access
      remember.value = fromLocal
    }

    hydrated.value = true
  }

  function persistTokens(tokens: { accessToken: string; remember: boolean }) {
    accessToken.value = tokens.accessToken
    remember.value = tokens.remember
    hydrated.value = true

    if (!import.meta.client) {
      return
    }

    if (tokens.remember) {
      clearAuthKeys(sessionStorage)
      storageRemove(localStorage, AUTH_STORAGE_KEYS.refreshToken)
      storageSet(localStorage, AUTH_STORAGE_KEYS.accessToken, tokens.accessToken)
      storageSet(localStorage, AUTH_STORAGE_KEYS.remember, '1')
      return
    }

    clearAuthKeys(localStorage)
    storageSet(sessionStorage, AUTH_STORAGE_KEYS.accessToken, tokens.accessToken)
  }

  function clearTokens() {
    accessToken.value = null
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
    remember: readonly(remember),
    hydrateFromStorage,
    persistTokens,
    clearTokens,
  }
}
