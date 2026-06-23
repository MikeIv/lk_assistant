export interface CabinetDirectoryNavItem {
  to: string
  label: string
  accent: string
  bannerGradientTo: string
}

export const directoryNavItems: CabinetDirectoryNavItem[] = [
  {
    to: '/directories/premises',
    label: 'Помещения',
    accent: 'var(--fs-figma-main-building-sport-complex)',
    bannerGradientTo: 'var(--fs-figma-vertical-children)',
  },
  {
    to: '/directories/legal-entities',
    label: 'Юр. лица',
    accent: 'var(--fs-figma-vertical-fitness)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
  },
  {
    to: '/directories/brands',
    label: 'Бренды',
    accent: 'var(--fs-figma-vertical-entertainments)',
    bannerGradientTo: 'var(--fs-figma-main-building-main)',
  },
  {
    to: '/directories/contracts',
    label: 'Договоры',
    accent: 'var(--fs-figma-vertical-shop)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
  },
  {
    to: '/directories/applicants',
    label: 'Претенденты',
    accent: 'var(--fs-figma-vertical-aqua-park)',
    bannerGradientTo: 'var(--fs-figma-vertical-surfing)',
  },
]

export function useCabinetDirectoriesNav() {
  const route = useRoute()

  function isDirectoryNavActive(to: string): boolean {
    const path = route.path
    return path === to || path.startsWith(`${to}/`)
  }

  return { items: directoryNavItems, isDirectoryNavActive }
}
