import type { CabinetSubNavItem } from '#shared/types/cabinetNav'

export const brokerNavItems: CabinetSubNavItem[] = [
  {
    to: '/broker/calendar',
    label: 'Календарь',
    accent: 'var(--fs-figma-vertical-events)',
    bannerGradientTo: 'var(--fs-figma-vertical-entertainments)',
    hasContent: true,
  },
  {
    to: '/broker/tasks',
    label: 'Мои задачи',
    accent: 'var(--fs-figma-vertical-sport)',
    bannerGradientTo: 'var(--fs-figma-vertical-aqua-park)',
    hasContent: true,
  },
  {
    to: '/broker/current',
    label: 'Текущие дела',
    accent: 'var(--fs-figma-vertical-shop)',
    bannerGradientTo: 'var(--fs-figma-main-building-concert-hall)',
    hasContent: true,
  },
]

export function findBrokerNavItem(section: string): CabinetSubNavItem | undefined {
  return brokerNavItems.find((item) => item.to === `/broker/${section}`)
}

export function resolveBrokerNavItemFromRoute(route: {
  path: string
  params: Record<string, string | string[] | undefined>
}): CabinetSubNavItem | undefined {
  const section = route.params.section
  if (typeof section === 'string' && section) {
    return findBrokerNavItem(section)
  }

  const match = route.path.match(/^\/broker\/([^/?#]+)/)
  return match?.[1] ? findBrokerNavItem(match[1]) : undefined
}

export function useCabinetBrokerNav() {
  const route = useRoute()

  const currentBrokerItem = computed(() => resolveBrokerNavItemFromRoute(route))

  function isBrokerNavActive(to: string): boolean {
    const path = route.path
    return path === to || path.startsWith(`${to}/`)
  }

  return { items: brokerNavItems, isBrokerNavActive, currentBrokerItem }
}
