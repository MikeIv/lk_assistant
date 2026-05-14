export interface CabinetNavItem {
  to: string
  label: string
  /** Только для роли администратора (ТЗ: «Мои пользователи»). */
  adminOnly?: boolean
}

const navItems: CabinetNavItem[] = [
  { to: '/', label: 'На главную' },
  { to: '/reports', label: 'Мои отчёты' },
  { to: '/applications', label: 'Мои заявки' },
  { to: '/users', label: 'Мои пользователи', adminOnly: true },
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
