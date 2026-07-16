import { AUTH_STORAGE_KEYS } from '#shared/constants/authStorage'

const AUTH_LOCAL_KEYS = new Set<string>([
  AUTH_STORAGE_KEYS.accessToken,
  AUTH_STORAGE_KEYS.remember,
  AUTH_STORAGE_KEYS.refreshToken,
])

/**
 * StorageEvent из другой вкладки: очистка auth-ключей в localStorage
 * (или clear() целиком) → нужно сбросить in-memory сессию.
 */
export function isCrossTabAuthLogoutEvent(
  event: { key: string | null; newValue: string | null },
  isLocalStorage: boolean,
): boolean {
  if (!isLocalStorage) {
    return false
  }

  if (event.key === null) {
    return true
  }

  return AUTH_LOCAL_KEYS.has(event.key) && event.newValue === null
}
