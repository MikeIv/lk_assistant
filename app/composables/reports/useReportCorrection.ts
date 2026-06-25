import { API_PATHS } from '#shared/constants/api'
import { getReportRequestHeaders } from '#shared/utils/reportsApiHeaders'

export function useReportCorrection() {
  const api = useApi()
  const isOpen = ref(false)
  const reportId = ref<number | null>(null)
  const text = ref('')
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  function open(id: number) {
    reportId.value = id
    text.value = ''
    error.value = null
    success.value = false
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    reportId.value = null
    text.value = ''
    error.value = null
    success.value = false
    isSubmitting.value = false
  }

  async function submit() {
    if (!reportId.value || text.value.trim().length === 0) {
      return
    }

    isSubmitting.value = true
    error.value = null

    try {
      await api(API_PATHS.tenants.reportRequestEdit(reportId.value), {
        method: 'POST',
        headers: getReportRequestHeaders(),
        body: {
          comment: text.value.trim(),
        },
      })

      success.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Не удалось отправить запрос'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isOpen,
    text,
    isSubmitting,
    error,
    success,
    open,
    close,
    submit,
  }
}
