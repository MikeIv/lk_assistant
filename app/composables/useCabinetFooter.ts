const CABINET_FOOTER_OPEN_KEY = 'cabinet-footer-open'

export function useCabinetFooter() {
  const open = useState(CABINET_FOOTER_OPEN_KEY, () => false)

  function toggle() {
    open.value = !open.value
  }

  function close() {
    open.value = false
  }

  return { open, toggle, close }
}
