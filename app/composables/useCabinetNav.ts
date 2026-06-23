import type { CabinetDirectoryNavItem } from '~/composables/useCabinetDirectoriesNav'
import { directoryNavItems } from '~/composables/useCabinetDirectoriesNav'

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
  /** Подразделы: родитель открывает подменю, не ведёт на `to`. */
  children?: readonly CabinetDirectoryNavItem[]
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
    children: directoryNavItems,
  },
]

export function useCabinetNav() {
  const route = useRoute()
  const expandedNavKey = useState<string | null>('cabinet-nav-submenu-key', () => null)

  function isNavActive(to: string): boolean {
    const path = route.path
    if (to === '/') {
      return path === '/' || path === ''
    }
    return path === to || path.startsWith(`${to}/`)
  }

  /** Один активный пункт верхнего уровня: «Справочники» перекрывает «/». */
  function isTopNavItemActive(item: CabinetNavItem): boolean {
    const directoriesActive = isNavActive('/directories') || expandedNavKey.value === '/directories'

    if (item.to === '/') {
      const onHome = route.path === '/' || route.path === ''
      return onHome && !directoriesActive
    }

    if (item.children?.length) {
      return isNavActive(item.to) || expandedNavKey.value === item.to
    }

    return isNavActive(item.to)
  }

  return { items: navItems, isNavActive, isTopNavItemActive }
}
