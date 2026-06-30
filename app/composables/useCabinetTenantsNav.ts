import type { CabinetSubNavItem } from '#shared/types/cabinetNav'

export const tenantNavItems: CabinetSubNavItem[] = [
  {
    to: '/tenants/registry',
    label: 'Реестр Арендаторов',
    accent: 'var(--fs-figma-vertical-fitness)',
    bannerGradientTo: 'var(--fs-figma-vertical-terms)',
  },
  {
    to: '/tenants/requests',
    label: 'Запросы от Арендаторов',
    accent: 'var(--fs-figma-vertical-food)',
    bannerGradientTo: 'var(--fs-figma-vertical-sport)',
  },
]

export function findTenantNavItem(section: string): CabinetSubNavItem | undefined {
  return tenantNavItems.find((item) => item.to === `/tenants/${section}`)
}

export function resolveTenantNavItemFromRoute(route: {
  path: string
  params: Record<string, string | string[] | undefined>
}): CabinetSubNavItem | undefined {
  const section = route.params.section
  if (typeof section === 'string' && section) {
    return findTenantNavItem(section)
  }

  const match = route.path.match(/^\/tenants\/([^/?#]+)/)
  return match?.[1] ? findTenantNavItem(match[1]) : undefined
}

export function useCabinetTenantsNav() {
  const route = useRoute()

  const currentTenantItem = computed(() => resolveTenantNavItemFromRoute(route))

  function isTenantNavActive(to: string): boolean {
    const path = route.path
    return path === to || path.startsWith(`${to}/`)
  }

  return { items: tenantNavItems, isTenantNavActive, currentTenantItem }
}
