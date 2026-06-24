import { SECTION_UNDER_DEVELOPMENT_BANNER } from '#shared/constants/sectionUnderDevelopment'
import type { CabinetNavItem } from '~/composables/useCabinetNav'

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
  path: string,
): SectionAccentSource | undefined {
  if (path === '/' || path === '') {
    return undefined
  }

  const subnavItems = topItems.flatMap((item) => item.children ?? [])
  const subnavMatch = subnavItems.find((item) => path === item.to || path.startsWith(`${item.to}/`))
  if (subnavMatch) {
    return subnavMatch
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

  const bannerProps = computed((): CabinetSectionBannerProps | undefined => {
    const path = sectionPath ?? route.path
    const navItem = resolveNavItemByPath(items, path)

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
