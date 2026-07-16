export default defineNuxtRouteMiddleware(async (to) => {
  const { ensureSession, isAuthenticated, hydrateFromStorage, accessToken, refreshToken } =
    useAuth()

  hydrateFromStorage()

  const isLoginPage = to.path === '/login'
  const hasStoredSession = Boolean(accessToken.value || refreshToken.value)

  if (isLoginPage && !hasStoredSession) {
    return
  }

  if (hasStoredSession) {
    await ensureSession()
  }

  if (!isAuthenticated.value && !isLoginPage) {
    return navigateTo('/login', { replace: true })
  }

  if (isAuthenticated.value && isLoginPage) {
    return navigateTo('/', { replace: true })
  }
})
