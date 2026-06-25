const ACCESS_TOKEN_STATE_KEY = 'api.accessToken'

/**
 * JWT Access Token для заголовка `Authorization: Bearer`.
 * Refresh — HttpOnly cookie (`credentials: 'include'` в {@link useApi}).
 */
export function useAuthToken() {
  const accessToken = useState<string | null>(ACCESS_TOKEN_STATE_KEY, () => null)

  function setAccessToken(token: string | null) {
    accessToken.value = token
  }

  function clearAccessToken() {
    setAccessToken(null)
  }

  return {
    accessToken: readonly(accessToken),
    setAccessToken,
    clearAccessToken,
  }
}
