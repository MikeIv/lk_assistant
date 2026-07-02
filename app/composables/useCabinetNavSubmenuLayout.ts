import type { CabinetNavItem } from '~/composables/useCabinetNav'
import {
  buildCabinetNavSubmenuStyleVars,
  getCabinetNavSubmenuPanelBleedPx,
} from '#shared/constants/cabinetNavSubmenu'

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
  const flyoutOffset = ref({ left: 0, top: 0, triggerCenterX: 0 })

  const panelBleedHalfPx = getCabinetNavSubmenuPanelBleedPx() / 2

  let layoutResizeObserver: ResizeObserver | null = null

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
      triggerCenterPx: flyoutOffset.value.triggerCenterX,
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
    const shellWidth = shellRect.width
    const anchorCenterX = anchorRect.left - shellRect.left + anchorRect.width / 2
    let flyoutLeft = anchorCenterX - flyoutWidth / 2

    if (flyoutWidth > 0) {
      flyoutLeft = Math.max(
        -panelBleedHalfPx,
        Math.min(flyoutLeft, shellWidth - flyoutWidth + panelBleedHalfPx),
      )
    }

    const nextOffset = {
      left: flyoutLeft,
      top: anchorRect.bottom - shellRect.top,
      triggerCenterX: anchorCenterX - flyoutLeft,
    }
    const nextTriggerWidth = measureTriggerWidth(anchor)

    if (triggerWidth.value !== nextTriggerWidth) {
      triggerWidth.value = nextTriggerWidth
    }

    if (
      flyoutOffset.value.left !== nextOffset.left ||
      flyoutOffset.value.top !== nextOffset.top ||
      flyoutOffset.value.triggerCenterX !== nextOffset.triggerCenterX
    ) {
      flyoutOffset.value = nextOffset
    }
  }

  function syncLayoutResizeObservers() {
    layoutResizeObserver?.disconnect()
    layoutResizeObserver = null

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const targets: HTMLElement[] = []
    if (triggerEl.value) {
      targets.push(resolveTriggerControl(triggerEl.value))
    }
    if (flyoutEl.value) {
      targets.push(flyoutEl.value)
    }

    if (targets.length === 0) {
      return
    }

    layoutResizeObserver = new ResizeObserver(() => {
      updateLayoutMetrics()
    })

    for (const target of targets) {
      layoutResizeObserver.observe(target)
    }
  }

  function bindTriggerRef(el: Element | ComponentPublicInstance | null) {
    triggerEl.value = el instanceof HTMLElement ? el : null
    updateLayoutMetrics()
    syncLayoutResizeObservers()
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

  function scheduleLayoutUpdate() {
    void nextTick(() => {
      updateLayoutMetrics()
      requestAnimationFrame(updateLayoutMetrics)
    })
  }

  watch(expandedNavKey, (key) => {
    if (!key) {
      triggerWidth.value = 0
      syncLayoutResizeObservers()
      return
    }
    scheduleLayoutUpdate()
  })

  watch(flyoutEl, () => {
    syncLayoutResizeObservers()
    if (flyoutEl.value) {
      scheduleLayoutUpdate()
    }
  })

  onMounted(() => {
    updateLayoutMetrics()
    syncLayoutResizeObservers()
    window.addEventListener('resize', updateLayoutMetrics, { passive: true })
  })

  onUnmounted(() => {
    layoutResizeObserver?.disconnect()
    layoutResizeObserver = null
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
    updateLayoutMetrics,
  }
}
