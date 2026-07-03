import type { CabinetSubNavItem } from '#shared/types/cabinetNav'

export type CabinetDirectoryNavItem = CabinetSubNavItem

export const directoryNavItems: CabinetDirectoryNavItem[] = [
  {
    to: '/directories/premises',
    label: 'Помещения',
    accent: 'var(--fs-figma-main-building-sport-complex)',
    bannerGradientTo: 'var(--fs-figma-vertical-children)',
    hasContent: true,
  },
  {
    to: '/directories/room-types',
    label: 'Типы помещений',
    accent: 'var(--fs-figma-main-building-main)',
    bannerGradientTo: 'var(--fs-figma-vertical-shop)',
    hasContent: true,
  },
  {
    to: '/directories/categories',
    label: 'Категория',
    accent: 'var(--fs-figma-vertical-children)',
    bannerGradientTo: 'var(--fs-figma-vertical-entertainments)',
    hasContent: true,
  },
  {
    to: '/directories/legal-entities',
    label: 'Юр. лица',
    accent: 'var(--fs-figma-vertical-fitness)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
    hasContent: true,
  },
  {
    to: '/directories/brands',
    label: 'Бренды',
    accent: 'var(--fs-figma-vertical-entertainments)',
    bannerGradientTo: 'var(--fs-figma-main-building-main)',
    hiddenInSubmenu: true,
  },
  {
    to: '/directories/contracts',
    label: 'Договоры',
    accent: 'var(--fs-figma-vertical-shop)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
    hiddenInSubmenu: true,
  },
  {
    to: '/directories/applicants',
    label: 'Претенденты',
    accent: 'var(--fs-figma-vertical-aqua-park)',
    bannerGradientTo: 'var(--fs-figma-vertical-surfing)',
    hasContent: true,
  },
]

export const directorySubmenuItems = directoryNavItems.filter((item) => !item.hiddenInSubmenu)

export function findDirectoryNavItem(section: string): CabinetDirectoryNavItem | undefined {
  return directoryNavItems.find((item) => item.to === `/directories/${section}`)
}

export function resolveDirectoryNavItemFromRoute(route: {
  path: string
  params: Record<string, string | string[] | undefined>
}): CabinetDirectoryNavItem | undefined {
  const section = route.params.section
  if (typeof section === 'string' && section) {
    return findDirectoryNavItem(section)
  }

  const match = route.path.match(/^\/directories\/([^/?#]+)/)
  return match?.[1] ? findDirectoryNavItem(match[1]) : undefined
}

export function useCabinetDirectoriesNav() {
  const route = useRoute()

  const currentDirectoryItem = computed(() => resolveDirectoryNavItemFromRoute(route))

  function isDirectoryNavActive(to: string): boolean {
    const path = route.path
    return path === to || path.startsWith(`${to}/`)
  }

  return { items: directoryNavItems, isDirectoryNavActive, currentDirectoryItem }
}
