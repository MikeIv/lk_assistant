/**
 * Ключи браузерного storage для JWT-сессии брокера.
 * В storage только access + remember; refresh — HttpOnly cookie.
 * `refreshToken` оставлен для очистки legacy-значений.
 */
export const AUTH_STORAGE_KEYS = {
  accessToken: 'lk.accessToken',
  /** @deprecated Не писать; только purge при hydrate/clear. */
  refreshToken: 'lk.refreshToken',
  remember: 'lk.remember',
} as const
