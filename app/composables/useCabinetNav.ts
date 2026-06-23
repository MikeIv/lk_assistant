export interface CabinetNavItem {
  to: string
  label: string
  /** Локальная SVG-коллекция: `i-local-nav-*`. */
  icon: string
  /**
   * Акцент Menu point (полоска Default / заливка Active).
   * Figma Vertical/* — node 13:164.
   */
  accent: string
  /** Второй цвет градиента баннера «раздел в разработке». */
  bannerGradientTo: string
  /** Пункт без цветной полоски (node 13:175). */
  home?: boolean
}

const navItems: CabinetNavItem[] = [
  {
    to: '/',
    label: 'Текущие дела',
    icon: 'i-local-nav-applications',
    accent: 'var(--fs-figma-vertical-shop)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
  },
  {
    to: '/directories',
    label: 'Справочники',
    icon: 'i-local-nav-data',
    accent: 'var(--fs-figma-vertical-gold-gallery)',
    bannerGradientTo: 'var(--fs-figma-vertical-events)',
  },
]

export function useCabinetNav() {
  const route = useRoute()

  function isNavActive(to: string): boolean {
    const path = route.path
    if (to === '/') {
      return path === '/' || path === ''
    }
    return path === to || path.startsWith(`${to}/`)
  }

  return { items: navItems, isNavActive }
}
