const LEGACY_PATHS = [
  '/reports',
  '/applications',
  '/passes',
  '/premises',
  '/data',
  '/users',
] as const

export default defineNuxtRouteMiddleware((to) => {
  const isLegacy = LEGACY_PATHS.some((path) => to.path === path || to.path.startsWith(`${path}/`))

  if (isLegacy) {
    return navigateTo('/', { replace: true })
  }
})
