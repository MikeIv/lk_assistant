const OPEN_EVENT = 'ui-dropdown-open'

export function useUiDropdown() {
  const wrapperRef = ref<HTMLElement | null>(null)
  const isOpen = ref(false)
  const instanceId = Symbol('ui-dropdown')

  function open() {
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

  function toggle() {
    if (isOpen.value) {
      close()
      return
    }
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
    toggle,
  }
}
