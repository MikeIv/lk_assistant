const OPEN_EVENT = 'ui-dropdown-open'

export interface UiDropdownCloseAfterSelectionOptions {
  suppressToggle?: boolean
  suppressOpen?: boolean
}

export function useUiDropdown() {
  const wrapperRef = ref<HTMLElement | null>(null)
  const isOpen = ref(false)
  const instanceId = Symbol('ui-dropdown')
  /** Сбрасывает повторный toggle от `<label>` после выбора пункта. */
  let suppressNextToggle = false
  /** Сбрасывает повторный open от клика по input в searchable-селекте. */
  let suppressNextOpen = false

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
    if (!wrapperRef.value?.contains(event.target as Node)) {
      close()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener(OPEN_EVENT, handleOtherOpen)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener(OPEN_EVENT, handleOtherOpen)
  })

  return {
    wrapperRef,
    isOpen,
    open,
    close,
    closeAfterSelection,
    toggle,
  }
}
