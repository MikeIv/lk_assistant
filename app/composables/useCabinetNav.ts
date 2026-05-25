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
  /** Второй цвет градиента баннера «раздел в разработке». */
  bannerGradientTo: string
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
    bannerGradientTo: 'var(--fs-figma-metallic-gradient-grey-3)',
  },
  {
    to: '/reports',
    label: 'Мои отчёты',
    icon: 'i-local-nav-report',
    accent: 'var(--fs-figma-vertical-shop)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
  },
  {
    to: '/applications',
    label: 'Мои заявки',
    icon: 'i-local-nav-applications',
    accent: 'var(--fs-figma-main-building-main)',
    bannerGradientTo: 'var(--fs-figma-vertical-entertainments)',
  },
  {
    to: '/passes',
    label: 'Мои пропуска',
    icon: 'i-local-nav-passes',
    accent: 'var(--fs-figma-vertical-aqua-park)',
    bannerGradientTo: 'var(--fs-figma-vertical-surfing)',
  },
  {
    to: '/premises',
    label: 'Моё помещение',
    icon: 'i-local-nav-premises',
    accent: 'var(--fs-figma-main-building-sport-complex)',
    bannerGradientTo: 'var(--fs-figma-vertical-children)',
  },
  {
    to: '/data',
    label: 'Мои данные',
    icon: 'i-local-nav-data',
    accent: 'var(--fs-figma-vertical-gold-gallery)',
    bannerGradientTo: 'var(--fs-figma-vertical-events)',
  },
  {
    to: '/users',
    label: 'Мои пользователи',
    icon: 'i-local-nav-users',
    adminOnly: true,
    accent: 'var(--fs-figma-vertical-fitness)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
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
