const OPEN_EVENT = 'ui-dropdown-open'
const DROPDOWN_PANEL_GAP_PX = 8

export interface UiDropdownCloseAfterSelectionOptions {
  suppressToggle?: boolean
  suppressOpen?: boolean
}

export function useUiDropdown() {
  const wrapperRef = ref<HTMLElement | null>(null)
  const panelRef = ref<HTMLElement | null>(null)
  const panelStyle = ref<Record<string, string>>({})
  const isOpen = ref(false)
  const instanceId = Symbol('ui-dropdown')
  /** Сбрасывает повторный toggle от `<label>` после выбора пункта. */
  let suppressNextToggle = false
  /** Сбрасывает повторный open от клика по input в searchable-селекте. */
  let suppressNextOpen = false
  let removePositionListeners: (() => void) | null = null

  function updatePanelPosition() {
    const wrapper = wrapperRef.value

    if (!wrapper) {
      return
    }

    const rect = wrapper.getBoundingClientRect()

    panelStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + DROPDOWN_PANEL_GAP_PX}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }

  function bindPositionListeners() {
    unbindPositionListeners()

    const update = () => updatePanelPosition()

    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    removePositionListeners = () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }

  function unbindPositionListeners() {
    removePositionListeners?.()
    removePositionListeners = null
  }

  function open() {
    if (suppressNextOpen) {
      suppressNextOpen = false
      return
    }

    window.dispatchEvent(
      new CustomEvent(OPEN_EVENT, {
        detail: instanceId,
      }),
    )
    // Before paint: avoid absolute→fixed jump inside scrollable dialogs.
    updatePanelPosition()
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function closeAfterSelection(options?: UiDropdownCloseAfterSelectionOptions) {
    close()
    suppressNextToggle = options?.suppressToggle ?? true
    suppressNextOpen = options?.suppressOpen ?? true
  }

  function toggle() {
    if (suppressNextToggle) {
      suppressNextToggle = false
      return
    }

    if (isOpen.value) {
      close()
      return
    }

    suppressNextOpen = false
    open()
  }

  function handleOtherOpen(event: Event) {
    const openedId = (event as CustomEvent<symbol>).detail
    if (openedId !== instanceId) {
      close()
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node

    if (wrapperRef.value?.contains(target) || panelRef.value?.contains(target)) {
      return
    }

    close()
  }

  watch(
    isOpen,
    (opened) => {
      if (!opened) {
        unbindPositionListeners()
        return
      }

      updatePanelPosition()
      bindPositionListeners()
    },
    { flush: 'post' },
  )

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener(OPEN_EVENT, handleOtherOpen)
  })

  onBeforeUnmount(() => {
    unbindPositionListeners()
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener(OPEN_EVENT, handleOtherOpen)
  })

  return {
    wrapperRef,
    panelRef,
    panelStyle,
    isOpen,
    open,
    close,
    closeAfterSelection,
    toggle,
  }
}
