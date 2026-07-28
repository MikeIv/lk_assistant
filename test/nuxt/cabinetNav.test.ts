import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { runComposable } from '../helpers/runComposable'
import {
  directorySubmenuItems,
  findDirectoryNavItem,
  resolveDirectoryNavItemFromRoute,
  useCabinetDirectoriesNav,
} from '~/composables/useCabinetDirectoriesNav'
import {
  brokerNavItems,
  findBrokerNavItem,
  resolveBrokerNavItemFromRoute,
  useCabinetBrokerNav,
} from '~/composables/useCabinetBrokerNav'
import {
  findTenantNavItem,
  resolveTenantNavItemFromRoute,
  tenantNavItems,
  useCabinetTenantsNav,
} from '~/composables/useCabinetTenantsNav'
import { useCabinetNav } from '~/composables/useCabinetNav'
import { useCabinetNavSubmenuLayout } from '~/composables/useCabinetNavSubmenuLayout'
import { useCabinetSectionBanner } from '~/composables/useCabinetSectionBanner'
import { useCabinetFooter } from '~/composables/useCabinetFooter'

const { routePath, routeParams } = vi.hoisted(() => ({
  routePath: { value: '/' },
  routeParams: { value: {} as Record<string, string | string[] | undefined> },
}))

mockNuxtImport('useRoute', () => {
  return () => ({
    get path() {
      return routePath.value
    },
    get params() {
      return routeParams.value
    },
  })
})

function setRoute(path: string, params: Record<string, string | string[] | undefined> = {}) {
  routePath.value = path
  routeParams.value = params
}

describe('cabinet nav pure helpers', () => {
  it('resolves directory/broker/tenant items and filters hidden submenu entries', () => {
    expect(findDirectoryNavItem('premises')?.label).toBe('Помещения')
    expect(findDirectoryNavItem('brands')?.hiddenInSubmenu).toBe(true)
    expect(directorySubmenuItems.some((item) => item.to.includes('brands'))).toBe(false)
    expect(
      resolveDirectoryNavItemFromRoute({
        path: '/directories/applicants',
        params: { section: 'applicants' },
      })?.label,
    ).toBe('Претенденты')

    expect(findBrokerNavItem('current')?.label).toBe('Текущие дела')
    expect(resolveBrokerNavItemFromRoute({ path: '/broker/tasks', params: {} })?.label).toBe(
      'Мои задачи',
    )
    expect(brokerNavItems).toHaveLength(3)

    expect(findTenantNavItem('registry')?.label).toBe('Реестр Арендаторов')
    expect(resolveTenantNavItemFromRoute({ path: '/tenants/requests', params: {} })?.label).toBe(
      'Запросы от Арендаторов',
    )
    expect(tenantNavItems).toHaveLength(2)
  })
})

describe('useCabinetNav / section nav', () => {
  beforeEach(() => {
    clearNuxtState('cabinet-nav-submenu-key')
    setRoute('/')
  })

  it('marks active routes and top-level items with submenu expansion', async () => {
    setRoute('/broker/current')

    const { result: nav, unmount } = runComposable(() => useCabinetNav())
    expect(nav.isNavActive('/broker')).toBe(true)
    expect(nav.isNavActive('/')).toBe(false)
    expect(nav.items.some((item) => item.to === '/directories')).toBe(true)

    const broker = nav.items.find((item) => item.to === '/broker')!
    expect(nav.isTopNavItemActive(broker)).toBe(true)

    const { result: layout, unmount: unmountLayout } = runComposable(() =>
      useCabinetNavSubmenuLayout(nav.items),
    )
    layout.toggleSubmenu(broker)
    await nextTick()
    expect(layout.isSubmenuExpanded(broker)).toBe(true)
    expect(nav.isTopNavItemActive(broker)).toBe(true)

    layout.closeSubmenu()
    await nextTick()
    expect(layout.isSubmenuExpanded(broker)).toBe(false)

    unmountLayout()
    unmount()
  })

  it('resolves current section items from route', () => {
    setRoute('/directories/legal-entities', { section: 'legal-entities' })
    const { result: directories, unmount: u1 } = runComposable(() => useCabinetDirectoriesNav())
    expect(directories.currentDirectoryItem.value?.label).toBe('Юр. лица')
    expect(directories.isDirectoryNavActive('/directories/legal-entities')).toBe(true)
    u1()

    setRoute('/broker/calendar', { section: 'calendar' })
    const { result: broker, unmount: u2 } = runComposable(() => useCabinetBrokerNav())
    expect(broker.currentBrokerItem.value?.label).toBe('Календарь')
    u2()

    setRoute('/tenants/registry', { section: 'registry' })
    const { result: tenants, unmount: u3 } = runComposable(() => useCabinetTenantsNav())
    expect(tenants.currentTenantItem.value?.label).toBe('Реестр Арендаторов')
    u3()
  })
})

describe('useCabinetSectionBanner / useCabinetFooter', () => {
  beforeEach(() => {
    clearNuxtState('cabinet-footer-open')
    setRoute('/')
  })

  it('returns banner for stub sections and undefined for content sections', () => {
    setRoute('/directories/brands', { section: 'brands' })
    const { result: banner, unmount } = runComposable(() => useCabinetSectionBanner())
    expect(banner.bannerProps.value?.title).toBeTruthy()
    expect(banner.bannerProps.value?.preset).toBe('custom')
    unmount()

    setRoute('/directories/premises', { section: 'premises' })
    const { result: premisesBanner, unmount: u2 } = runComposable(() => useCabinetSectionBanner())
    expect(premisesBanner.bannerProps.value).toBeUndefined()
    u2()
  })

  it('toggles footer open state', () => {
    const { result: footer, unmount } = runComposable(() => useCabinetFooter())
    expect(footer.open.value).toBe(false)
    footer.toggle()
    expect(footer.open.value).toBe(true)
    footer.close()
    expect(footer.open.value).toBe(false)
    unmount()
  })
})
