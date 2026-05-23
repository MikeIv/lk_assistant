import type { ComputedRef, InjectionKey } from 'vue'

export interface ReportsTableContext {
  isMockMode: ComputedRef<boolean>
  downloadReport: (id: number) => Promise<void>
  downloadAttachments: (id: number) => Promise<void>
  isReportDownloading: (id: number) => boolean
  isAttachmentsDownloading: (id: number) => boolean
  openCorrection: (id: number) => void
}

export const reportsTableContextKey: InjectionKey<ReportsTableContext> =
  Symbol('reports-table-context')

export function useReportsTableContext() {
  const context = inject(reportsTableContextKey)

  if (!context) {
    throw new Error('useReportsTableContext must be used inside ReportsTable')
  }

  return context
}
