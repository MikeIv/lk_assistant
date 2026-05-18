export interface CabinetNavItem {
  to: string
  label: string
  /** Локальная SVG-коллекция: `i-local-nav-*`. */
  icon: string
  /** Только для роли администратора (ТЗ: «Мои пользователи»). */
  adminOnly?: boolean
  /**
   * Акцент Menu point (полоска Default / заливка Active).
   * Figma Vertical/* — node 13:164.
   */
  accent: string
  /** Пункт «Главная»: active без цветной полоски (node 13:175). */
  home?: boolean
}

const navItems: CabinetNavItem[] = [
  {
    to: '/',
    label: 'Новости',
    icon: 'i-local-nav-home',
    home: true,
    accent: 'var(--fs-color-cabinet-nav-indicator-home)',
  },
  {
    to: '/reports',
    label: 'Мои отчёты',
    icon: 'i-local-nav-report',
    accent: 'var(--fs-figma-vertical-shop)',
  },
  {
    to: '/applications',
    label: 'Мои заявки',
    icon: 'i-local-nav-applications',
    accent: 'var(--fs-figma-main-building-main)',
  },
  {
    to: '/users',
    label: 'Мои пользователи',
    icon: 'i-local-nav-users',
    adminOnly: true,
    accent: 'var(--fs-figma-vertical-fitness)',
  },
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
