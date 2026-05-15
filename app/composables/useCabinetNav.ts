export interface CabinetNavItem {
  to: string
  label: string
  /** Локальная SVG-коллекция: `i-local-nav-*`. */
  icon: string
  /** Только для роли администратора (ТЗ: «Мои пользователи»). */
  adminOnly?: boolean
}

const navItems: CabinetNavItem[] = [
  { to: '/', label: 'На главную', icon: 'i-local-nav-home' },
  { to: '/reports', label: 'Мои отчёты', icon: 'i-local-nav-report' },
  { to: '/applications', label: 'Мои заявки', icon: 'i-local-nav-applications' },
  { to: '/users', label: 'Мои пользователи', icon: 'i-local-nav-users', adminOnly: true },
]

export function useCabinetNav() {
  const { role } = useCabinetRole()

  const items = computed(() =>
    navItems.filter((item) => (role.value === 'admin' ? true : !item.adminOnly)),
  )

  const route = useRoute()

  function isNavActive(to: string): boolean {
    const path = route.path
    if (to === '/') {
      return path === '/' || path === ''
    }
    return path === to || path.startsWith(`${to}/`)
  }

  return { items, isNavActive }
}
