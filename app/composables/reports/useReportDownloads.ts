import { API_PATHS } from '#shared/constants/api'
import { getReportRequestHeaders } from '#shared/utils/reportsApiHeaders'

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function updateDownloadingSet(set: Ref<Set<number>>, id: number, active: boolean) {
  const next = new Set(set.value)

  if (active) {
    next.add(id)
  } else {
    next.delete(id)
  }

  set.value = next
}

export function useReportDownloads() {
  const api = useApi()
  const downloadingReports = ref<Set<number>>(new Set())
  const downloadingDocuments = ref<Set<number>>(new Set())
  const error = ref<string | null>(null)

  async function downloadReport(id: number) {
    updateDownloadingSet(downloadingReports, id, true)
    error.value = null

    try {
      const blob = await api<Blob>(API_PATHS.tenants.reportPdf(id), {
        headers: {
          Accept: 'application/pdf',
          ...getReportRequestHeaders(),
        },
        responseType: 'blob',
      })

      triggerBrowserDownload(blob, `Report_${id}.pdf`)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Ошибка при скачивании отчёта'
      throw cause
    } finally {
      updateDownloadingSet(downloadingReports, id, false)
    }
  }

  async function downloadAttachments(id: number) {
    updateDownloadingSet(downloadingDocuments, id, true)
    error.value = null

    try {
      const blob = await api<Blob>(API_PATHS.tenants.reportDocuments(id), {
        headers: getReportRequestHeaders(),
        responseType: 'blob',
      })

      triggerBrowserDownload(blob, `Attachments_${id}.zip`)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Ошибка при скачивании вложений'
      throw cause
    } finally {
      updateDownloadingSet(downloadingDocuments, id, false)
    }
  }

  function isReportDownloading(id: number): boolean {
    return downloadingReports.value.has(id)
  }

  function isAttachmentsDownloading(id: number): boolean {
    return downloadingDocuments.value.has(id)
  }

  return {
    error,
    downloadReport,
    downloadAttachments,
    isReportDownloading,
    isAttachmentsDownloading,
  }
}
