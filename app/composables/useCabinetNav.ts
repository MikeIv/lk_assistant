import type { CabinetSubNavItem } from '#shared/types/cabinetNav'
import { directorySubmenuItems } from '~/composables/useCabinetDirectoriesNav'
import { brokerNavItems } from '~/composables/useCabinetBrokerNav'
import { tenantNavItems } from '~/composables/useCabinetTenantsNav'

export type { CabinetSubNavItem }

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
  children?: readonly CabinetSubNavItem[]
}

const navItems: CabinetNavItem[] = [
  {
    to: '/',
    label: 'Главная',
    icon: 'i-local-nav-home',
    accent: 'var(--fs-color-cabinet-nav-indicator-home)',
    bannerGradientTo: 'var(--fs-figma-metallic-gradient-grey-2)',
    home: true,
  },
  {
    to: '/broker',
    label: 'Брокер',
    icon: 'i-local-nav-applications',
    accent: 'var(--fs-figma-vertical-shop)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
    children: brokerNavItems,
  },
  {
    to: '/tenants',
    label: 'Арендаторы',
    icon: 'i-local-nav-users',
    accent: 'var(--fs-figma-vertical-fitness)',
    bannerGradientTo: 'var(--fs-figma-vertical-terms)',
    children: tenantNavItems,
  },
  {
    to: '/directories',
    label: 'Справочники',
    icon: 'i-local-nav-data',
    accent: 'var(--fs-figma-vertical-gold-gallery)',
    bannerGradientTo: 'var(--fs-figma-vertical-events)',
    children: directorySubmenuItems,
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

  /** Один активный пункт верхнего уровня: подменю не гасит «Главную» на `/`. */
  function isTopNavItemActive(item: CabinetNavItem): boolean {
    const submenuExpanded = expandedNavKey.value !== null

    if (item.home) {
      return isNavActive('/') && !submenuExpanded
    }

    if (item.children?.length) {
      return isNavActive(item.to) || expandedNavKey.value === item.to
    }

    return isNavActive(item.to)
  }

  return { items: navItems, isNavActive, isTopNavItemActive }
}
