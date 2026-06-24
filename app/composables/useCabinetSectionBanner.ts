import { SECTION_UNDER_DEVELOPMENT_BANNER } from '#shared/constants/sectionUnderDevelopment'
import type { CabinetNavItem } from '~/composables/useCabinetNav'
import type { CabinetDirectoryNavItem } from '~/composables/useCabinetDirectoriesNav'

export interface CabinetSectionBannerProps {
  title: string
  text: string
  preset: 'custom'
  gradientFrom: string
  gradientTo: string
}

type SectionAccentSource = Pick<CabinetNavItem, 'accent' | 'bannerGradientTo'>

function resolveNavItemByPath(
  topItems: CabinetNavItem[],
  directoryItems: CabinetDirectoryNavItem[],
  path: string,
): SectionAccentSource | undefined {
  if (path === '/' || path === '') {
    return undefined
  }

  const directoryMatch = directoryItems.find(
    (item) => path === item.to || path.startsWith(`${item.to}/`),
  )
  if (directoryMatch) {
    return directoryMatch
  }

  const topMatch = topItems.find((item) => {
    if (item.home) {
      return false
    }
    return path === item.to || path.startsWith(`${item.to}/`)
  })

  return topMatch
}

/**
 * Пропсы баннера «раздел в разработке» с градиентом по акценту пункта меню.
 */
export function useCabinetSectionBanner(sectionPath?: string) {
  const route = useRoute()
  const { items } = useCabinetNav()
  const { items: directoryItems } = useCabinetDirectoriesNav()

  const bannerProps = computed((): CabinetSectionBannerProps | undefined => {
    const path = sectionPath ?? route.path
    const navItem = resolveNavItemByPath(items, directoryItems, path)

    if (!navItem) {
      return undefined
    }

    return {
      ...SECTION_UNDER_DEVELOPMENT_BANNER,
      preset: 'custom',
      gradientFrom: navItem.accent,
      gradientTo: navItem.bannerGradientTo,
    }
  })

  return { bannerProps }
}
