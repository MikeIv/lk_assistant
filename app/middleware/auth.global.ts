export default defineNuxtRouteMiddleware(async (to) => {
  const { ensureSession, isAuthenticated, hydrateFromStorage, accessToken } = useAuth()
  const { remember } = useAuthToken()

  hydrateFromStorage()

  const isLoginPage = to.path === '/login'

  // Cookie-refresh: защищённые маршруты всегда; login — если есть access или «Запомнить меня».
  // Чистый аноним на /login — без лишнего 419.
  if (accessToken.value || remember.value || !isLoginPage) {
    await ensureSession()
  }

  if (!isAuthenticated.value && !isLoginPage) {
    return navigateTo('/login', { replace: true })
  }

  if (isAuthenticated.value && isLoginPage) {
    return navigateTo('/', { replace: true })
  }
})
