import type { CabinetNavItem } from '~/composables/useCabinetNav'
import { buildCabinetNavSubmenuStyleVars } from '#shared/constants/cabinetNavSubmenu'

function resolveTriggerControl(anchor: HTMLElement): HTMLElement {
  return anchor.querySelector<HTMLElement>(':scope > a, :scope > button') ?? anchor
}

function measureTriggerWidth(anchor: HTMLElement): number {
  return resolveTriggerControl(anchor).getBoundingClientRect().width
}

/**
 * Измерение и CSS-переменные flyout-подменю.
 * Ref триггера вешается только на раскрытый пункт — иначе цикл обновлений при нескольких children.
 */
export function useCabinetNavSubmenuLayout(items: readonly CabinetNavItem[]) {
  const expandedNavKey = useState<string | null>('cabinet-nav-submenu-key', () => null)

  const triggerEl = ref<HTMLElement | null>(null)
  const shellWrapEl = ref<HTMLElement | null>(null)
  const flyoutEl = ref<HTMLElement | null>(null)
  const triggerWidth = ref(0)
  const flyoutOffset = ref({ left: 0, top: 0 })

  let triggerResizeObserver: ResizeObserver | null = null

  const expandedNavItem = computed(() =>
    items.find((item) => item.to === expandedNavKey.value && item.children?.length),
  )

  const submenuReady = computed(() => Boolean(expandedNavItem.value && triggerWidth.value > 0))

  const submenuStyle = computed(() => {
    const item = expandedNavItem.value
    if (!item || triggerWidth.value <= 0) {
      return undefined
    }

    return buildCabinetNavSubmenuStyleVars({
      accent: item.accent,
      triggerWidthPx: triggerWidth.value,
      flyoutLeftPx: flyoutOffset.value.left,
      flyoutTopPx: flyoutOffset.value.top,
    })
  })

  function updateLayoutMetrics() {
    const anchor = triggerEl.value
    const shell = shellWrapEl.value
    const flyout = flyoutEl.value

    if (!anchor || !shell) {
      if (triggerWidth.value !== 0) {
        triggerWidth.value = 0
      }
      return
    }

    const anchorRect = anchor.getBoundingClientRect()
    const shellRect = shell.getBoundingClientRect()
    const flyoutWidth = flyout?.offsetWidth ?? 0
    const anchorCenterX = anchorRect.left - shellRect.left + anchorRect.width / 2
    const nextOffset = {
      left: anchorCenterX - flyoutWidth / 2,
      top: anchorRect.bottom - shellRect.top,
    }
    const nextTriggerWidth = measureTriggerWidth(anchor)

    if (triggerWidth.value !== nextTriggerWidth) {
      triggerWidth.value = nextTriggerWidth
    }

    if (flyoutOffset.value.left !== nextOffset.left || flyoutOffset.value.top !== nextOffset.top) {
      flyoutOffset.value = nextOffset
    }
  }

  function bindTriggerRef(el: Element | ComponentPublicInstance | null) {
    triggerResizeObserver?.disconnect()
    triggerResizeObserver = null

    const node = el instanceof HTMLElement ? el : null
    triggerEl.value = node

    if (!node) {
      return
    }

    updateLayoutMetrics()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    triggerResizeObserver = new ResizeObserver(() => {
      updateLayoutMetrics()
    })
    triggerResizeObserver.observe(resolveTriggerControl(node))
  }

  function isSubmenuExpanded(item: CabinetNavItem): boolean {
    return expandedNavKey.value === item.to
  }

  function toggleSubmenu(item: CabinetNavItem) {
    expandedNavKey.value = isSubmenuExpanded(item) ? null : item.to
  }

  function closeSubmenu() {
    expandedNavKey.value = null
  }

  function syncExpandedNavFromRoute(path: string) {
    const submenuParent = items.find(
      (item) => item.children?.length && (path === item.to || path.startsWith(`${item.to}/`)),
    )
    const nextKey = submenuParent?.to ?? null
    if (expandedNavKey.value !== nextKey) {
      expandedNavKey.value = nextKey
    }
  }

  function scheduleLayoutUpdate() {
    void nextTick(() => {
      updateLayoutMetrics()
      requestAnimationFrame(() => {
        updateLayoutMetrics()
      })
    })
  }

  watch(expandedNavKey, (key) => {
    if (!key) {
      triggerWidth.value = 0
      return
    }
    scheduleLayoutUpdate()
  })

  onMounted(() => {
    updateLayoutMetrics()
    window.addEventListener('resize', updateLayoutMetrics, { passive: true })
  })

  onUnmounted(() => {
    triggerResizeObserver?.disconnect()
    triggerResizeObserver = null
    window.removeEventListener('resize', updateLayoutMetrics)
  })

  return {
    expandedNavKey,
    expandedNavItem,
    submenuReady,
    submenuStyle,
    shellWrapEl,
    flyoutEl,
    bindTriggerRef,
    isSubmenuExpanded,
    toggleSubmenu,
    closeSubmenu,
    syncExpandedNavFromRoute,
    updateLayoutMetrics,
  }
}
