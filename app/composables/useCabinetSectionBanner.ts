import { SECTION_UNDER_DEVELOPMENT_BANNER } from '#shared/constants/sectionUnderDevelopment'
import type { CabinetNavItem } from '~/composables/useCabinetNav'

export interface CabinetSectionBannerProps {
  title: string
  text: string
  preset: 'custom'
  gradientFrom: string
  gradientTo: string
}

function resolveNavItemByPath(items: CabinetNavItem[], path: string): CabinetNavItem | undefined {
  if (path === '/' || path === '') {
    return undefined
  }

  return items.find((item) => {
    if (item.to === '/') {
      return false
    }

    return path === item.to || path.startsWith(`${item.to}/`)
  })
}

/**
 * Пропсы баннера «раздел в разработке» с градиентом по акценту пункта нижнего меню.
 */
export function useCabinetSectionBanner(sectionPath?: string) {
  const route = useRoute()
  const { items } = useCabinetNav()

  const bannerProps = computed((): CabinetSectionBannerProps | undefined => {
    const path = sectionPath ?? route.path
    const navItem = resolveNavItemByPath(items.value, path)

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
