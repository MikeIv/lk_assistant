import { FlexRender, getCoreRowModel, useVueTable, type ColumnDef } from '@tanstack/vue-table'
import { computed, h, type Ref } from 'vue'
import ReportCorrectionCell from '~/components/reports/cells/ReportCorrectionCell.vue'
import ReportDownloadActionsCell from '~/components/reports/cells/ReportDownloadActionsCell.vue'
import ReportEditActionsCell from '~/components/reports/cells/ReportEditActionsCell.vue'
import ReportSelectCell from '~/components/reports/cells/ReportSelectCell.vue'
import ReportStatusCell from '~/components/reports/cells/ReportStatusCell.vue'
import {
  formatReportMoney,
  formatReportPeriod,
  formatReportSubmittedAt,
} from '#shared/utils/reportsFormat'
import type { ReportHeader, ReportItem } from '#shared/types/reports'

export { FlexRender }

interface UseReportsTableOptions {
  headers: Ref<ReportHeader[]>
  reports: Ref<ReportItem[]>
  selectedReports: Ref<Set<number>>
  showSelectColumn: Ref<boolean>
  onToggleSelect: (id: number) => void
}

export function useReportsTable({
  headers,
  reports,
  selectedReports,
  showSelectColumn,
  onToggleSelect,
}: UseReportsTableOptions) {
  const columns = computed<ColumnDef<ReportItem>[]>(() => {
    const selectColumn: ColumnDef<ReportItem> = {
      id: 'select',
      size: 40,
      header: () => '',
      cell: ({ row }) => {
        const report = row.original

        if (report.status !== 'Draft' || !report.can_edit) {
          return null
        }

        return h(ReportSelectCell, {
          checked: selectedReports.value.has(report.id),
          onToggle: () => onToggleSelect(report.id),
        })
      },
    }

    const dataColumns: ColumnDef<ReportItem>[] = headers.value.map((header) => {
      const base: ColumnDef<ReportItem> = {
        accessorKey: header.key,
        header: header.label,
        size: header.key === 'id' ? 56 : 0,
      }

      switch (header.key) {
        case 'id':
          return {
            ...base,
            cell: ({ row }) => row.original.id,
          }
        case 'period':
          return {
            ...base,
            size: 140,
            cell: ({ row }) => formatReportPeriod(row.original.period),
          }
        case 'turnover_amount':
          return {
            ...base,
            size: 130,
            cell: ({ row }) => `${formatReportMoney(row.original.turnover_amount)} ₽`,
          }
        case 'turnover_fee':
          return {
            ...base,
            size: 130,
            cell: ({ row }) => `${formatReportMoney(row.original.turnover_fee)} ₽`,
          }
        case 'status':
          return {
            ...base,
            size: 180,
            cell: ({ row }) => h(ReportStatusCell, { status: row.original.status }),
          }
        case 'can_edit':
          return {
            ...base,
            size: 160,
            cell: ({ row }) => h(ReportEditActionsCell, { report: row.original }),
          }
        case 'can_download_documents':
          return {
            ...base,
            size: 180,
            cell: ({ row }) => h(ReportDownloadActionsCell, { report: row.original }),
          }
        case 'can_request_correction':
          return {
            ...base,
            size: 120,
            cell: ({ row }) => h(ReportCorrectionCell, { report: row.original }),
          }
        case 'submitted_at':
          return {
            ...base,
            size: 120,
            cell: ({ row }) => formatReportSubmittedAt(row.original.submitted_at),
          }
        default:
          return base
      }
    })

    return showSelectColumn.value ? [selectColumn, ...dataColumns] : dataColumns
  })

  const table = useVueTable({
    get data() {
      return reports.value
    },
    get columns() {
      return columns.value
    },
    getCoreRowModel: getCoreRowModel(),
  })

  return { table, columns }
}
